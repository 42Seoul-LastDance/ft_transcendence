//DB에 저장된 모든 유저 반환 (현재는 id 순)
const userList = document.getElementById('userList');
fetch(`http://127.0.0.1:3000/users`)
  .then(response => response.json())
  .then(data => {
    data.forEach(user => {
      const listItem = document.createElement('li');
      listItem.textContent = `${user.name} (ID: ${user.id}) - image: ${user.profileurl}`;
      userList.appendChild(listItem);
    });
  })
  .catch(error => console.error(error));


//DB에 신규 유저 등록
document.getElementById('addUser').addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const userName = formData.get('name');

  try {
      const response = await fetch('http://127.0.0.1:3000/users/addOne', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json' // Set content type to JSON
          },
          body: JSON.stringify({ name: userName }), // Send user name as JSON
      });

      if (response.ok) {
          const result = await response.json();
          alert('User registered:', result);
      } else {
          alert('User registration failed');
      }
  } catch (error) {
      console.error('An error occurred:', error);
  }
});

//정확히 일치하는 유저네임 있는지 확인 (유저명 중복체크용)
document.getElementById('searchOne').addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const userName = formData.get('name');

  try {
    const response = await fetch(`http://127.0.0.1:3000/users/searchOne?name=${userName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
      const contentLength = response.headers.get('content-length');
      if (contentLength === '0') {//response 내용이 없을 경우 response.json() 시에 에러가 떠서 추가함
          alert('사용가능한 유저네임입니다.');
      } else {
        const data = await response.json();
        if (data) {
          alert('사용중인 유저네임입니다. 다른 이름을 사용하세요');
        } else { //안나올듯...
          alert('사용가능한 유저네임입니다.');
        }
      }
    } else {
        alert('User search failed');
    }
  } catch (error) {
    alert('An error occurred:', error);
  }
});

//유저네임 검색기능, 해당하는 문자열로 시작하는 모든 유저네임 사전순으로 반환
document.getElementById('searchUsers').addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const searchResult = document.getElementById('searchResult');
  const userName = formData.get('name');

  try {
    const response = await fetch(`http://127.0.0.1:3000/users/searchUsers?name=${userName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response.json();
        searchResult.innerHTML = ''; // Clear previous search results
        data.forEach(user => {
            const listItem = document.createElement('li');
            listItem.textContent = `${user.name} (image: ${user.profileurl})`;
            searchResult.appendChild(listItem);
        });
    } else {
        alert('User search failed');
    }
  } catch (error) {
    alert('An error occurred:', error);
  }

});

//유저 탈퇴용(로그인한 상태에서만 가능 => 없는 ID 삭제시에도 성공 메시지 뜸)
document.getElementById('deleteOne').addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const userId = formData.get('id');

  try {
    const response = await fetch(`http://127.0.0.1:3000/users/deleteOne/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
      alert('User deleted successfully');
      form.reset(); // Clear the form after successful deletion
    } else {
        alert('User deletion failed');
    }
  } catch (error) {
    alert('An error occurred:', error);
  }

});