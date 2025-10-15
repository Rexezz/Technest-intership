// Sample Users (for demo)
const USERS = [{username:'student1', password:'123'}];

// Video lessons
const VIDEOS = [
  {id:1, title:'Intro to HTML', src:'https://www.youtube.com/embed/dD2EISBDjWM'},
  {id:2, title:'CSS Basics', src:'https://www.youtube.com/embed/yfoY53QXEnI'},
];

// Quizzes
const QUIZZES = [
  {id:1, question:'What does HTML stand for?', options:['Hyper Text Markup Language','High Text Markup','Home Tool Markup'], answer:0},
  {id:2, question:'Which property changes text color in CSS?', options:['color','font-size','background'], answer:0},
];

// DOM Elements
const loginForm = document.getElementById('loginForm');
const dashboard = document.getElementById('dashboard');
const studentName = document.getElementById('studentName');
const videoList = document.getElementById('videoList');
const quizList = document.getElementById('quizList');
const progressEl = document.getElementById('progress');
const userSection = document.getElementById('userSection');

// Login
document.getElementById('submitLogin').addEventListener('click', ()=>{
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const user = USERS.find(u=>u.username===username && u.password===password);
  if(user){
    loginForm.classList.add('hidden');
    dashboard.classList.remove('hidden');
    studentName.textContent = username;
    localStorage.setItem('currentUser', username);
    loadDashboard();
  }else{
    alert('Invalid login!');
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  dashboard.classList.add('hidden');
  loginForm.classList.remove('hidden');
  localStorage.removeItem('currentUser');
});

// Load dashboard
function loadDashboard(){
  renderVideos();
  renderQuizzes();
  renderProgress();
}

// Render Videos
function renderVideos(){
  videoList.innerHTML = '';
  VIDEOS.forEach(v=>{
    const div = document.createElement('div');
    div.className='bg-white p-3 rounded shadow';
    div.innerHTML = `
      <h4 class="font-semibold mb-2">${v.title}</h4>
      <iframe class="w-full h-40" src="${v.src}" title="${v.title}" frameborder="0" allowfullscreen></iframe>
      <button class="mt-2 px-3 py-1 bg-teal-600 text-white rounded completeVideo" data-id="${v.id}">Mark as Completed</button>
    `;
    videoList.appendChild(div);
  });
  document.querySelectorAll('.completeVideo').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      markCompletedVideo(id);
    });
  });
}

// Render Quizzes
function renderQuizzes(){
  quizList.innerHTML='';
  QUIZZES.forEach(q=>{
    const div = document.createElement('div');
    div.className='bg-white p-3 rounded shadow';
    div.innerHTML = `
      <p class="font-semibold mb-2">${q.question}</p>
      <div class="options space-y-1">
        ${q.options.map((opt,i)=>`<button class="px-2 py-1 border rounded quizOption" data-qid="${q.id}" data-opt="${i}">${opt}</button>`).join('')}
      </div>
    `;
    quizList.appendChild(div);
  });

  document.querySelectorAll('.quizOption').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const qid = e.target.dataset.qid;
      const opt = e.target.dataset.opt;
      checkQuizAnswer(qid,opt);
    });
  });
}

// Progress tracking in localStorage
function markCompletedVideo(id){
  let progress = JSON.parse(localStorage.getItem('progress')||'{}');
  progress.videos = progress.videos || [];
  if(!progress.videos.includes(id)) progress.videos.push(id);
  localStorage.setItem('progress', JSON.stringify(progress));
  renderProgress();
}

function checkQuizAnswer(qid,opt){
  qid=parseInt(qid); opt=parseInt(opt);
  let progress = JSON.parse(localStorage.getItem('progress')||'{}');
  progress.quizzes = progress.quizzes || {};
  const correct = QUIZZES.find(q=>q.id===qid).answer===opt;
  progress.quizzes[qid]=correct;
  localStorage.setItem('progress', JSON.stringify(progress));
  alert(correct?'Correct!':'Wrong!');
  renderProgress();
}

function renderProgress(){
  const progress = JSON.parse(localStorage.getItem('progress')||'{}');
  const completedVideos = (progress.videos||[]).length;
  const totalVideos = VIDEOS.length;
  const quizzes = progress.quizzes || {};
  const completedQuizzes = Object.keys(quizzes).length;
  const correctQuizzes = Object.values(quizzes).filter(v=>v).length;
  progressEl.innerHTML = `
    <p>Videos completed: ${completedVideos} / ${totalVideos}</p>
    <p>Quizzes attempted: ${completedQuizzes} / ${QUIZZES.length}</p>
    <p>Quizzes correct: ${correctQuizzes}</p>
  `;
}

// Auto-login if user in localStorage
const currentUser = localStorage.getItem('currentUser');
if(currentUser){
  loginForm.classList.add('hidden');
  dashboard.classList.remove('hidden');
  studentName.textContent = currentUser;
  loadDashboard();
}
