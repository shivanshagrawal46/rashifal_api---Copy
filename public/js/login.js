document.addEventListener('DOMContentLoaded', () => {
    document
      .getElementById('showPwd')
      .addEventListener('change', (e) => {
        const pwd = document.getElementById('passwordField');
        pwd.type = e.target.checked ? 'text' : 'password';
      });
  });
  