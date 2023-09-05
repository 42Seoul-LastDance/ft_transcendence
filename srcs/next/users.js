//42login
document.getElementById('login42').addEventListener('submit', async (event) => {
  event.preventDefault();
  alert('1111');
  try {
      const response = await fetch('http://127.0.0.1:3000/auth/42login', {
          method: 'GET',
      });

      alert('2222');
      
      if (response.ok) {
        alert('User registered:', result);

          const result = await response.json();
      } else {
          alert('User registration failed');
      }
  } catch (error) {
      console.error('An error occurred:', error);
  }
});
