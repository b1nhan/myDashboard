// Ví dụ gọi API được bảo vệ
// async function getTasks() {
//     const token = localStorage.getItem('token');
//     if (!token) {
//         alert('Vui lòng đăng nhập để xem tasks.');
//         return;
//     }
    
//     const response = await fetch('/api/tasks', {
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     });

//     const tasks = await response.json();
//     if (response.ok) {
//         console.log('Tasks của bạn:', tasks);
//         // Hiển thị tasks ra giao diện
//     } else {
//         alert(tasks.message);
//     }
// }
      
async function handleLogin(event) {
    event.preventDefault(); // Ngăn form submit
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageBox = document.getElementById('messageBox');

    // Xóa thông báo cũ
    messageBox.textContent = '';
    messageBox.className = 'mt-4 p-3 rounded-lg text-sm text-center hidden';

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    messageBox.textContent = data.message;
    if (response.ok) {
        localStorage.setItem('token', data.token);
        // alert(data.message + ' Token: ' + data.token);
        // Chuyển hướng hoặc hiển thị giao diện todo list
        // messageBox.textContent = 'Đăng nhập thành công!';
        setTimeout(redirectToDashboard, 1000);
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-green-100', 'text-green-800');
    } else {
        // alert(data.message, data.status);
        // messageBox.textContent = 'Tên người dùng hoặc mật khẩu không đúng.';
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-red-100', 'text-red-800');
    }
}

async function handleRegister(event){
    event.preventDefault(); // Ngăn form submit
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageBox = document.getElementById('messageBox');

    // Xóa thông báo cũ
    messageBox.textContent = '';
    messageBox.className = 'mt-4 p-3 rounded-lg text-sm text-center hidden';

    // Kiểm tra các trường
    if (password !== confirmPassword) {
        messageBox.textContent = 'Xác nhận mật khẩu không khớp.';
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-red-100', 'text-red-800');
        return;
    }

    
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();

    messageBox.textContent = data.message;
    switch (response.status) {
      case 409:
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-red-100', 'text-red-800');
        break;
      case 500:
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-red-100', 'text-red-800');
        break;
      case 201:
        messageBox.classList.remove('hidden');
        messageBox.classList.add('bg-green-100', 'text-green-800');
        setTimeout(redirectToLogin, 1000);
      default:
        break;
    }

    
    
}

function Logout(){
    localStorage.removeItem('token');
    redirectToLogin();
}

function isLoggedIn() {
  const token = localStorage.getItem('token');
  return !!token; // Trả về true nếu token tồn tại
}

function redirectToLogin() {
  window.location.href = '/login.html';
}

function redirectToDashboard() {
  window.location.href = '/index.html';
}