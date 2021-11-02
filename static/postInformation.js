
// eslint-disable-next-line no-unused-vars
function teljesPoszt(id) {
  fetch(`/api/post/${id}`)
    .then((response) => response.json())
    // eslint-disable-next-line array-callback-return
    .then((responseText) => responseText.map((message) => {
      document.getElementById('result').innerHTML = `PostID: ${message.postID} <br><br> UploadDate: ${message.uploadDate} <br>`;
    }));
}
// eslint-disable-next-line no-unused-vars
function kepTorles(e) {
  const { id } = e.target.dataset;
  console.log(id);
  fetch(`/api/images/${id}`, {
    method: 'DELETE',
  })
    .then((response) => response.json())
    // eslint-disable-next-line array-callback-return
    .then((response) => {
      if (response.ok) {
        const uzenet = document.createElement('div');
        uzenet.innerHTML = 'Torles sikeres';

        e.target.parentNode.replaceWith(uzenet);
      } else {
        const uzenet = document.createElement('div');
        uzenet.innerHTML = 'Torles sikertelen';
        e.target.parentNode.insertBefore(uzenet, e.target);
      }
    });
}

const gombok = document.querySelectorAll('.torol');
gombok.forEach((gomb) => {
  gomb.addEventListener('click', kepTorles);
});
