import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../context/user.context';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import Markdown from 'markdown-to-jsx';
import { getWebContainer } from '../config/webContainer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css'


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if(window.hljs && ref.current && props.className?.includes('lang-')) {
            window.hljs.highlightElement(ref.current);
            ref.current.removeAttribute('data-highlighted');
        }
    }, [props.className, props.children])

    return <code {...props} ref={ref} />
}


const Project = () => {

    const location = useLocation();

    const [ isSidePanelOpen, setIsSidePanelOpen ] = useState(false)
    const [ isModalOpen, setIsModalOpen ] = useState(false)
    const [ selectedUserId, setSelectedUserId ] = useState(new Set())
    const [ project, setProject ] = useState(location.state.project)
    const [ message, setMessage ] = useState("")
    const { user } = useContext(UserContext)
    const messageBox = React.createRef()

    const [ users, setUsers ] = useState([])
    const [ messages, setMessages ] = useState([])
    const [ fileTree, setFileTree ] = useState({})
    const [ currentFile, setCurrentFile ] = useState(null)
    const [ openFiles, setOpenFiles ] = useState([])
    const [ webContainer, setWebContainer] = useState(null)
    const [ iframeURL, setIframeURL] = useState(null)
    const [ runProcess, setRunProcess] = useState(null)
    const [ isRunClickedOnce, setIsRunClickedOnce ] = useState(false);

    const apiUrl = import.meta.env.VITE_API_URL;

    const handleUserClick = (id) => {
        setSelectedUserId(prevSelectedUserId => {
          const newSelectedUserId = new Set(prevSelectedUserId);
          if(newSelectedUserId.has(id)){
            newSelectedUserId.delete(id);
          }else{
            newSelectedUserId.add(id)
          }
          return newSelectedUserId;
        });
    }

    function addCollaborators(){

        const alreadyCollaborator = Array.from(selectedUserId).some(id => 
            project.users.some(user => user._id === id)
        );

        if(alreadyCollaborator){
          toast.info("Selected users are already collaborators.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            graggable: true,
            closeOnClick: true,
            progress: undefined,
            toastClassName: "Toastify__toast--info Toastify__icon--info custom-toast-icon",
        });
        return;
        }

        axios.put(`${apiUrl}/projects/add-user`, {
          projectId: location.state.project._id,
          users: Array.from(selectedUserId)
        }).then(res => {
              axios.get(`${apiUrl}/projects/get-project/${location.state.project._id}`)
                .then(res => {
                    setProject(res.data.project);
                    setIsModalOpen(false);

                    toast.success("Collaborators added successfully!", {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      draggable: true,
                      progress: undefined,
                      toastClassName: "Toastify__toast--info Toastify__icon--info custom-toast-icon",
                    });

                }).catch(err => {
                    console.log(err);
                });
        }).catch(err => {
              console.log(err);
        })
    }


    function send(){

        // if(message.trim() === '') return;

        console.log("User:", user);
        console.log("Message to send:", message);

        sendMessage('project-message', {
          message,
          sender: user
        })
        setMessages(prevMessages => [ ...prevMessages, { sender: user, message } ])
        setMessage("")
    }

    function WriteAiMessage(message){

        let messageObject = {};

        try {
            messageObject = JSON.parse(message);
        } catch (e) {
            messageObject.text = message;
        }
        
        return(
          <div>
              <Markdown 
                  children={messageObject.text}
                  options={{
                      overrides: {
                          code: SyntaxHighlightedCode,
                      },
                  }}
              />
          </div>
        )
    }


   useEffect(() => {

    initializeSocket(project._id);
    
    if(!webContainer){
        getWebContainer().then(container => {
            setWebContainer(container);
            console.log("container started")
        })
    }

    receiveMessage('project-message', data => {

      console.log(data)
      
      if (data.sender._id == 'ai') {


          const message = JSON.parse(data.message)

          console.log(message)

          webContainer?.mount(message.fileTree)

          if (message.fileTree) {
              setFileTree(message.fileTree || {})
          }
          setMessages(prevMessages => [ ...prevMessages, data ]) 
      } else {
          setMessages(prevMessages => [ ...prevMessages, data ]) 
      }
  })

    axios.get(`/projects/get-project/${location.state.project._id}`)
    .then(res => {
      setProject(res.data.project);
      setFileTree(res.data.project.fileTree || {}); 
    }).catch(err => {
      console.log(err);
    });

    axios.get('/users/all').then(res => {
      setUsers(res.data.users);
    }).catch(err => {
      console.log(err);
    });

   },[])

   useEffect(() => {
      if(messageBox.current){
          messageBox.current.scrollTop = messageBox.current.scrollHeight;
      }
   },[messages])

   function saveFileTree(ft){
      axios.put(`${apiUrl}/projects/update-file-tree`, {
        projectId: project._id,
        fileTree: ft
      }).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })  
   }


  return (
    <main className='h-screen w-screen flex'>
      <ToastContainer toastClassName="Toastify__toast--info Toastify__icon--info custom-toast-icon"
        className="custom-toast-container" />

        <section className='left relative h-full flex flex-col bg-gradient-to-r from-[#243949] to-[#517fa4] min-w-90'>

          <header className='w-full p-2 px-4 flex justify-between items-center bg-white/6 relative z-10 top-0'>  
            <button className='gap-1 flex cursor-pointer' onClick={() => setIsModalOpen(true)} >
              < i className="ri-add-fill mr-1 text-lg text-zinc-200"></i>
              <p className='text-md text-white font-semibold hover:text-zinc-200'>Add collaborator</p>
            </button>

            <button className='p-2 text-lg cursor-pointer' onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                < i className="ri-group-fill text-[#243949]"></i>
            </button>   
          </header>

          <div className="conversation-area h-full pt-0.5 pb-10 flex-grow flex flex-col relative">
              <div
                  ref={messageBox}
                  className="message-box flex-grow flex flex-col gap-2 p-1 overflow-auto max-h-full scrollbar-hide"
                  style={{
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    paddingBottom: '20px',
                  }}>
                  {messages.map((msg, index) => {
                    return(
                      <div key={index} className={`message flex flex-col p-2 bg-zinc-300 w-fit rounded-md ${msg.sender._id === 'ai' ? 'max-w-52 color' : 'max-w-52'} ${msg.sender._id === user._id.toString() ? 'ml-auto' : ''}`}>
                        <small className='opacity-75 text-sm text-zinc-400'>{msg.sender.email}</small>
                        <div className='text-sm rounded-lg'>
                          {msg.sender._id === 'ai' ? 
                              WriteAiMessage(msg.message) : <p>{msg.message}</p>
                          }
                        </div>
                      </div>
                    )
                  })}
              </div>

              <div className="inputField w-full flex absolute bottom-0">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text" className='bg-white/6 px-14 py-3 rounded-full m-1 outline-none caret-white text-white' placeholder="Message" />
                  <button
                    onClick={send}
                    className='text-md flex-grow m-1 rounded-full bg-white/6 ml-0.5 cursor-pointer'>
                    < i className="ri-send-plane-2-fill text-[#243949]"></i>
                  </button>
              </div>
          </div>

          <div className={`sidePanel flex flex-col gap-2 w-full absolute h-full bg-white/3 bg-opacity-30 backdrop-blur-lg transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} z-20  `}>
              <header className='w-full p-2 px-4 flex justify-between items-center bg-gradient-to-r from-[#243949] to-[#517fa4]'>
                    <h1 className='text-zinc-200 text-md font-semibold'>Collaborators</h1>
                    <button className='p-2 text-xl cursor-pointer' onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}>
                        < i className="ri-close-fill font-bold text-[#243949]"></i>
                    </button>
              </header>

              <div className="users m-1 flex flex-col gap-2">
                  {project.users.map(user => { 
                    return (
                      <div key={user._id} className="user cursor-pointer flex gap-2 items-center bg-[#517fa4] rounded-full">
                          <div className='aspect-square rounded-full text-[#243949] w-fit h-fit flex items-center justify-center px-5 py-3 bg-zinc-200'>
                              <i className="ri-user-3-fill text-md absolute"></i>
                          </div>
                          <h1 className='font-semibold text-md text-[#243949] bg-[#517fa4]'>{user.email}</h1>
                      </div>
                    )
                  })}
              </div>
          </div>
        </section>


        <section className='right flex bg-white flex-grow flex-col sm:flex-row'>

          <div className="explorer h-full sm:max-w-60 w-full min-w-56 bg-zinc-200 border-r border-zinc-400">
                <div className="file-tree w-full">
                    {
                      Object.keys(fileTree).map((file, index) => {
                        return(
                          <button
                          onClick={() => {
                            setCurrentFile(file)
                            setOpenFiles([  ...new Set([...openFiles, file]) ])
                          }}
                          key={index} 
                          className="tree-element text-black border-b border-zinc-400 cursor-pointer p-2 px-4 flex items-center gap-2 w-full hover:bg-zinc-300">
                              <p className='font-semibold text-md'>{file}</p>
                          </button>
                        )
                      })
                    }
                </div>
          </div>

              <div className="code-editor flex flex-col flex-grow h-full">
                     <div className="top flex border-b justify-between w-full border-zinc-400 bg-zinc-200">
                        <div className="file flex flex-wrap">
                        {
                          openFiles.map((file, index) => {
                            return (
                              <div key={index} className="flex items-center gap-2">
                                  <button
                                      className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 border-r border-zinc-400 ${currentFile === file ? 'bg-zinc-300 text-black' : 'text-zinc-500'}`}
                                      onClick={() => setCurrentFile(file)}>
                                      <p className='font-semibold text-md'>{file}</p>

                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                
                                              setOpenFiles(prevOpenFiles => prevOpenFiles.filter(f => f !== file));

                                              // If the file being closed is the current file, set currentFile to null
                                              if (currentFile === file) {
                                                  setCurrentFile(null);
                                              }
                                          }}
                                          className="text-[#243949] text-sm font-bold ml-2 hover:text-[#517fa4]"
                                      >
                                          <i className="ri-close-fill text-lg"></i>
                                      </button>
                                  </button>
                              </div>

                            )
                          })
                        }
                        </div>

                        <div className="actions flex gap-2">
                            <button
                                onClick={async () => {

                                  if (!isRunClickedOnce) {
                                    toast.info("Please click again to load the iframe!", {
                                      position: "top-right",
                                      autoClose: 5000,
                                      hideProgressBar: true,
                                      closeOnClick: true,
                                      draggable: true,
                                      progress: undefined,
                                    });

                                  await webContainer.mount(fileTree)

                                  const installProcess = await webContainer.spawn("npm", ["install"])

                                  installProcess.output.pipeTo(new WritableStream({
                                      write(chunk){
                                        console.log(chunk);
                                      }
                                  }))

                                  setIsRunClickedOnce(true);
                                  } else {

                                  if(runProcess){
                                      runProcess.kill()
                                  }
                                  
                                  let tempRunProcess = await webContainer.spawn("npm", ["start"])

                                  tempRunProcess.output.pipeTo(new WritableStream({
                                      write(chunk){
                                        console.log(chunk);
                                      }
                                  }))

                                  setRunProcess(tempRunProcess)

                                  webContainer.on('server-ready', (port, url) => {
                                      console.log(port, url)
                                      setIframeURL(url)
                                  })

                                  setIsRunClickedOnce(false);

                                }
                              }}
                                className='bg-[#517fa4] p-2 px-4 font-semibold text-white hover:text-zinc-200 cursor-pointer'
                            >
                              run
                            </button>
                        </div>
                     </div>

                     <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
                        { 
                            fileTree[ currentFile ] && (
                                <div className="code-editor-area h-full overflow-auto flex-grow">
                                    {fileTree[currentFile] && fileTree[currentFile].file && fileTree[currentFile].file.contents ? (
                                    <pre className='hljs h-full'>
                                        <code
                                            className='hljs h-full outline-none'
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => {
                                                const updatedContent = e.target.innerText;
                                               
                                                const ft = {
                                                    ...fileTree,
                                                    [ currentFile ]: {
                                                        file: {
                                                          contents: updatedContent
                                                        }
                                                    }
                                                }
                                                setFileTree(ft)
                                                saveFileTree(ft)
                                            }}
                                            dangerouslySetInnerHTML = {{
                                               __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value 
                                            }}
                                            style = {{
                                                whiteSpace: 'pre-wrap',
                                                paddingBottom: '25rem',
                                                counterSet: 'line-numbering'
                                            }}
                                        />  
                                    </pre>
                                    ) : (
                                      <div className="text-black">No content available</div>
                                  )}
                                </div>
                              )
                        }
                     </div>
              </div>

              {iframeURL && webContainer && 
                  (<div className='flex min-w-96 flex-col h-full border border-l-zinc-400'>
                      <div className='address-bar'>
                            <input type='text'
                                onChange={(e) => setIframeURL(e.target.value)}
                                value={iframeURL} className='w-full p-2 px-4 bg-zinc-200 border-zinc-400'
                            />
                      </div>
                      <iframe src={iframeURL} className='w-full h-1/2'></iframe>
                  </div>)
              }


        </section>

        {isModalOpen && (
          <div className='fixed inset-0 bg-opacity-50 flex items-center justify-center'>
            <div className='bg-white/6 bg-opacity-30 backdrop-blur-lg border border-zinc-300 p-6 rounded-sm shadow-md w-1/3 max-w-full relative transform transition-all duration-300'>
              <header className='flex justify-between items-center mb-4'>
                  <h2 className='text-xl font-bold text-[#243949]'>Select User</h2>
                  <button onClick={() => setIsModalOpen(false)}>
                      <i className="ri-close-fill text-2xl cursor-pointer font-bold"></i>
                  </button>
              </header>
              <div className='users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto'>
                    {users.map(user => {
                      const isSelected = selectedUserId.has(user._id);
                      return(
                      <div key={user._id} className='user cursor-pointer p-2 flex gap-2 items-center' onClick={() => handleUserClick(user._id)} >
                          <div className='aspect-square rounded-full text-[#243949] w-fit h-fit flex items-center justify-center px-4 py-3 bg-zinc-300'>
                              <i className="ri-user-fill absolute"></i>
                          </div>
                          <h1 className='font-semibold text-md text-[#243949]'>{user.email}</h1>
                          <div className='ml-auto cursor-pointer flex items-center'>
                              <i className={`ri-check-line text-2xl font-bold rounded-full px-1 ${isSelected ? 'text-[#517fa4]' : 'text-gray-400'}`} />
                          </div>
                      </div>
                      );
                    })}
              </div>
              <div className='items-center justify-center flex mt-2'>
                <button
                    type="button"
                    onClick={addCollaborators}
                    className='px-4 py-2 cursor-pointer font-semibold bg-[#517fa4] text-white rounded-md hover:text-zinc-200 transition'>
                    Add Collaborators
                </button>
              </div>   
            </div>
          </div>
          )}
    </main>
  )
}

export default Project