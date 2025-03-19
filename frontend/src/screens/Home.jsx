import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserContext } from '../context/user.context';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css'


const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(''); 
  const [project, setProject] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [isLeaveProjectModalOpen, setIsLeaveProjectModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);


  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_URL;

  function createProject(e) {

    e.preventDefault();
  
    axios
      .get(`${apiUrl}/projects/check-project-name?name=${projectName}`)
      .then((res) => {

          if(res.data.exist){
            toast.error('Project name already in use. Please choose a different name.',{
              position: "top-right",
              closeOnClick: true,
              autoClose: 5000,
              hideProgressBar: true,
              draggable: true,
              progress: undefined,
              toastClassName: "Toastify__toast--error Toastify__icon--error custom-toast-icon",
            });
            return
          }

          axios
            .post(`${apiUrl}/projects/create`, {
              name: projectName,
            })
            .then((res) => {

            const newProject = res.data; 

            if (newProject && newProject._id && newProject.name) {
              setProject((prevProjects) => [...prevProjects, newProject]);

            } else {
              console.error('Invalid response format:', newProject);
            }
              setProjectName(''); 
              setIsModalOpen(false); 

              toast.success("Project created successfully!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
                progress: undefined,
                toastClassName: "Toastify__toast--info Toastify__icon--info custom-toast-icon",
              });
            })
            .catch((error) => {
              console.log(error);
              toast.error('Failed to create the project. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                draggable: true,
                progress: undefined,
                toastClassName: "Toastify__toast--error Toastify__icon--error custom-toast-icon",
              });
            });
          }).catch((error) => {
            console.log(error);
            toast.error('Failed to check project name. Please try again later.', {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              draggable: true,
              progress: undefined,
              toastClassName: "Toastify__toast--error Toastify__icon--error custom-toast-icon",
            });
        });
  }

  const handleLeaveProject = async (projectId) => {

      if(!projectId) {
        toast.error('No project selected.');
        return;
      }

      try{
        const res = await axios.put(`${apiUrl}/projects/leave-project`, {
          projectId: projectId, 
          userId: user._id
        })

      setProject((prevProjects) => {
        return prevProjects.filter(project => project._id !== projectId);
      });

      setSelectedProjectId('');
      setIsLeaveProjectModalOpen(false);

      toast.success('Sucessfully left the project!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          draggable: true,
          progress: undefined,
          toastClassName: "Toastify__toast--info Toastify__icon--info custom-toast-icon",
        });

        // const updatedProject = await axios.get('/projects/all');
        // setProject(updatedProject);

    }catch (err) {
      toast.error('Failed to leave the project. Please try again later.');
        console.error(err);
    }
  };

  useEffect(() => {
    axios
      .get(`${apiUrl}/projects/all`)
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

 
  return (
    <main className='min-h-screen p-4 bg-white relative'>
      <ToastContainer toastClassName="Toastify__toast--info Toastify__icon--info custom-toast-icon"
        className="custom-toast-container"/>

      <div className={`flex flex-col sm:flex-row justify-between gap-4 ${isModalOpen ? 'backdrop-blur-md ' : ''}`}>
        <div className='flex flex-col gap-3 overflow-auto max-h-screen flex-1'>
              <h1 className='text-xl font-bold text-[#243949] mb-6'>
                  Welcome👋, {user ? user.email : 'Guest'}
              </h1>
            <div className='flex justify-between gap-1'>
                <button
                    onClick={() => setIsModalOpen(true)} 
                    className='project text-lg py-3 px-4 w-full font-bold rounded-lg bg-gradient-to-r from-[#243949] to-[#517fa4] hover:text-zinc-200 text-white'>
                    New Project
                    <i className='ri-add-line ml-2'></i>
                </button>

                <button
                    onClick={() => setIsLeaveProjectModalOpen(true)}
                    className='project text-lg py-3 px-4 w-full font-bold rounded-lg bg-gradient-to-r from-[#a0464e] to-[#c3757c] hover:text-zinc-200 text-white'>
                    Leave Project
                    <i className='ri-delete-bin-line ml-2'></i>
                </button>
            </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-1 ml-1 mr-1'>
            {Array.isArray(project) && project.length > 0 ? (
              project.map((project) => {

              if (!project) {
                  return null;
              }
              return (
                <div
                  key={project._id}
                  onClick={() => {
                    navigate('/project', {
                      state: { project }, //sending project data
                    });
                  }}
                  className='w-full project flex flex-col gap-1 cursor-pointer p-4 border-2 border-zinc-400 bg-zinc-200 font-semibold rounded-lg transform transition-all hover:scale-101 hover:shadow-md'>
                  <h2 className='font-bold text-[#243949] text-xl'>{project.name}</h2>
                  <div className='flex gap-2 text-zinc-400'>
                    <p>
                      <small>
                        <i className='text-[#243949] ri-user-3-fill mr-1'></i>Collaborators:
                      </small>
                    </p>
                    {project.users.length}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-start text-zinc-400">No projects available.</p>
          )}
          </div>
        </div>
        <div className='flex-shrink-0 w-full sm:w-1/2'>
          <img src='/images/collabGif.gif' alt='Collaborate with Google Gemini' className='mt-15 h-auto mx-auto' />
        </div>
      </div>


  {isLeaveProjectModalOpen && (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white/3 backdrop-blur-lg p-6 border border-zinc-400 rounded-md shadow-md w-full sm:w-60 lg:w-1/3 transform transition-all scale-95 duration-300">
          <h2 className="text-xl sm:text-md mb-4 font-bold text-[#243949]">
            <i className="ri-user-unfollow-line mr-2"></i>Leave Project
          </h2>
          <div className="mb-4">
            <label className="block text-md font-semibold text-zinc-500">Select project</label>
            
            <div className="relative">
              <div
                className="mt-1 block w-full p-2 border border-[#243949] rounded-md focus:outline-none focus:ring-1 focus:ring-[#517fa4] cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {selectedProjectId ? project.find(p => p._id === selectedProjectId)?.name : "Select"}
              </div>
              {isDropdownOpen && (
                <ul className="absolute left-0 w-full bg-white border border-[#243949] rounded-md mt-1 z-10">
                  <li
                    className="p-2 cursor-pointer text-zinc-400"
                    onClick={() => setSelectedProjectId("")}
                  >
                    Select a project to leave
                  </li>
                  {project.map((proj) => (
                    <li
                      key={proj._id}
                      className="p-2 cursor-pointer hover:bg-zinc-200 text-[#243949] font-semibold"
                      onClick={() => setSelectedProjectId(proj._id)}
                    >
                      {proj.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

          <div className='flex justify-end'>
                <button
                    type='button'
                    className='mr-2 block cursor-pointer px-4 p-2 border border-[#c3757c] rounded-md text-[#c3757c] font-semibold'
                    onClick={() => setIsLeaveProjectModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                    type='button'
                    className='cursor-pointer px-4 py-2 bg-[#c3757c] text-white rounded-md hover:text-[#a0464e] transition font-semibold'
                    onClick={() => handleLeaveProject(selectedProjectId)}
                >
                  Leave Project
                </button>
              </div>
        </div>
      </div>
    )}
  
      {isModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center'>
          <div className='bg-white/3 backdrop-blur-lg p-6 border border-zinc-400 rounded-md shadow-md w-full sm:w-60 lg:w-1/3 transform transition-all scale-95 duration-300'>
            <h2 className='text-xl sm:text-md mb-4 font-bold text-[#243949]'><i className="ri-folder-add-line mr-2"></i> Create New Project</h2>
            <form onSubmit={createProject}>
              <div className='mb-4'>
                <label className='block text-md font-semibold text-zinc-500'>Project Name</label>
                <input
                onChange={(e) => setProjectName(e.target.value)} 
                  value={projectName} 
                  type='text'
                  placeholder='Enter project name'
                  className='mt-1 block w-full p-2 border border-[#243949] rounded-md focus:outline-none focus:ring-1 focus:ring-[#517fa4]'
                  required
                />
              </div>

              <div className='flex justify-end'>
                <button
                  type='button'
                  className='mr-2 block cursor-pointer px-4 p-2 border border-[#517fa4] rounded-md font-semibold text-[#517fa4]'
                  required
                  onClick={() => {
                    setIsModalOpen(false); 
                    setProjectName(''); 
                  }}>
                  Cancel
                </button>
                <button type='submit' className='font-semibold cursor-pointer px-4 py-2 bg-[#517fa4] text-white rounded-md hover:text-[#243949] transition'>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
