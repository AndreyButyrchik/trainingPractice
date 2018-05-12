// eslint-disable-next-line no-unused-vars
const events = (function events() {
  const fileTypes = [
    'image/jpeg',
    'image/img',
    'image/png',
    'image/jpg'
  ];

  let currentEditedPost = null;

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function validFileType(file) {
    let isValid = false;
    fileTypes.forEach((item) => {
      if (file.type === item) {
        isValid = true;
      }
    });
    return isValid;
  }

  const upload = async function upload(e) {
    const file = e.target.files[0];
    if (validFileType(file)) {
      domFunc.checkSuccess();
      const formData = new FormData();
      formData.append('upPhoto', file);
      const submitPost = document.getElementsByName('submitPost')[0];
      try {
        submitPost.value = await requestFunctions.uploadFile(formData);
      } catch (err) {
        throw new Error(`Ooops ${err}`);
      }
    } else {
      domFunc.checkInvalid();
      return false;
    }
    return true;
  };

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const dtfiles = dt.files;
    const file = Array.from(dtfiles);
    if (validFileType(file[0]) &&
      upload(file[0])) {
      domFunc.checkSuccess();
    } else {
      domFunc.checkInvalid();
    }
  }

  function eDropDownArea() {
    const dropArea = document.getElementsByClassName('drug-drop')[0];
    const ePrefDefaults = ['dragenter', 'dragover', 'dragleave', 'drop'];
    ePrefDefaults.forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function highlight() {
      dropArea.classList.add('highlight');
    }

    function unhighlight() {
      dropArea.classList.remove('highlight');
    }

    const eHighLight = ['dragenter', 'dragover'];
    eHighLight.forEach((eventName) => {
      dropArea.addEventListener(eventName, highlight, false);
    });

    const eUnHighLight = ['dragleave', 'drop'];
    eUnHighLight.forEach((eventName) => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
  }

  const showModalRemovePost = function showModalRemovePost(event) {
    const modalWindow = document.getElementById('modalWindowConfirmDelete');
    domFunc.showModalRemovePost();

    const buttonConfirm = document.getElementsByName('Yes')[0];
    buttonConfirm.onclick = removePhotoPost;
    buttonConfirm.value = event.target.parentElement.id;

    const buttonReset = document.getElementsByName('No')[0];
    buttonReset.addEventListener('click', () => {
      modalWindow.classList.remove('visible');
      modalWindow.classList.add('hidden');
    });
  };

  const eLikePost = function eLikePost(post) {
    post.addEventListener('click', likePost);
  };

  const eSingIn = function eSingIn() {
    domFunc.showModalSingIn();
    const buttonNext = document.getElementsByName('next')[0];
    buttonNext.onclick = domFunc.logIn;
  };

  const logOut = function logOut() {
    user = null;
    domFunc.logOut();
  };

  const eShowMorePhotoPosts = async function eShowMorePhotoPosts() {
    const cntShowPosts = document.getElementsByClassName('postBox').length;
    try {
      return await showPhotoPosts(cntShowPosts, 8, filterConfig, false);
    } catch (err) {
      throw new Error(`Ooops ${err}`);
    }
  };

  const filterByAuthor = async function filterByAuthor() {
    const filtForm = document.getElementsByName('author')[0];
    const filtInput = filtForm.childNodes[1];
    filterConfig.author = filtInput.value;
    try {
      return await domFunc.filtingPhotoPosts();
    } catch (err) {
      throw new Error(`Ooops ${err}`);
    }
  };

  const filterByDate = async function filterByDate() {
    const filtForm = document.getElementsByName('date')[0];
    const filtInput = filtForm.childNodes[1];
    const date = filtInput.value;
    if (date !== '') {
      const listDate = date.split('.');
      filterConfig.createdAt = new Date(listDate[2], listDate[1] - 1, listDate[0]);
    } else {
      filterConfig.createdAt = {};
    }
    try {
      return await domFunc.filtingPhotoPosts();
    } catch (err) {
      throw new Error(`Ooops ${err}`);
    }
  };

  const filterByHashtags = async function filterByHashtags() {
    const filtForm = document.getElementsByName('hashtags')[0];
    const filtInput = filtForm.childNodes[1];
    const hashtags = filtInput.value;
    const listHashtags = hashtags.split(' ');
    if (listHashtags.length !== 1 || listHashtags[0] !== '') {
      filterConfig.hashtags = listHashtags;
    } else {
      filterConfig.hashtags = [];
    }
    try {
      return await domFunc.filtingPhotoPosts();
    } catch (err) {
      throw new Error(`Ooops ${err}`);
    }
  };

  const eAddPost = async function eAddPost() {
    const addForm = document.getElementsByName('submitPost')[0];
    const inputDescription = document.getElementsByName('addDescription')[0];
    const inputHashtags = document.getElementsByName('addHashtags')[0];
    const photoPost = {
      id: '',
      descriprion: `${inputDescription.value}`,
      createdAt: new Date(),
      author: user,
      photoLink: `${addForm.value}`,
      hashtags: inputHashtags.value.split(' '),
      likes: [''],
      removed: false
    };

    if (inputDescription.value.length !== 0 &&
      new RegExp(inputHashtags.getAttribute('pattern')).test(inputHashtags.value) &&
      addPhotoPost(photoPost, true)) {
      const modalWindow = document.getElementById('modalWindowAddEditPhotoPost');
      modalWindow.classList.remove('visible');
      modalWindow.classList.add('hidden');
      return true;
    }
    domFunc.checkInvalid();
    return false;
  };

  const eEditPost = function eEditPost() {
    const editForm = document.getElementsByName('submitPost')[0];
    const inputDescription = document.getElementsByName('addDescription')[0];
    const inputHashtags = document.getElementsByName('addHashtags')[0];
    const photoPost = {
      id: currentEditedPost.id,
      descriprion: `${inputDescription.value}`,
      createdAt: currentEditedPost.createdAt,
      author: user,
      photoLink: `${editForm.value}`,
      hashtags: inputHashtags.value.split(' '),
      likes: currentEditedPost.likes,
      removed: false
    };

    if (inputDescription.value.length !== 0 &&
      new RegExp(inputHashtags.getAttribute('pattern')).test(inputHashtags.value) &&
      editPhotoPost(currentEditedPost.id, photoPost)) {
      const modalWindow = document.getElementById('modalWindowAddEditPhotoPost');
      modalWindow.classList.remove('visible');
      modalWindow.classList.add('hidden');
      return true;
    }
    domFunc.checkInvalid();
    return false;
  };

  function resetFormAddPhoto() {
    domFunc.resetFormAddPhoto();

    const submit = document.getElementsByName('publishPost')[0];
    submit.removeEventListener('click', eEditPost);
    submit.removeEventListener('click', eAddPost);
  }

  const eShowModalAddPost = function eShowModalAddPost() {
    resetFormAddPhoto();
    const inputFile = document.getElementsByName('upPhoto')[0];
    inputFile.onchange = upload;
    domFunc.showModalAddEditPost();
    eDropDownArea();
    const submit = document.getElementsByName('publishPost')[0];
    submit.addEventListener('click', eAddPost);
  };

  const eShowModalEditPost = function eShowModalEditPost(event) {
    resetFormAddPhoto();
    const inputFile = document.getElementsByName('upPhoto')[0];
    inputFile.onchange = upload;
    const post = event.target.parentElement;
    currentEditedPost = post;
    domFunc.showModalEdit(post);
    eDropDownArea();
    domFunc.checkSuccess();
    const submit = document.getElementsByName('publishPost')[0];
    submit.addEventListener('click', eEditPost);
  };

  const closeWindow = function closeWindow(event) {
    if (event.target.id === 'modalWindowAddEditPhotoPost' ||
      event.target.id === 'modalWindowConfirmDelete' ||
      event.target.id === 'modalWindowSingIn' ||
      event.target.id === 'modalWindowError') {
      const modalWindow = event.target;
      modalWindow.classList.remove('visible');
      modalWindow.classList.add('hidden');
    }
  };

  const eToMain = async function eToMain() {
    const modalWindow = document.getElementById('modalWindowError');
    modalWindow.classList.remove('visible');
    modalWindow.classList.add('hidden');

    filterConfig.author = '';
    filterConfig.hashtags = [];
    filterConfig.createdAt = {};
    try {
      return await showPhotoPosts(0, 8, filterConfig, true);
    } catch (err) {
      throw new Error(`Ooops ${err}`);
    }
  };

  return {
    eLikePost,
    showModalRemovePost,
    eSingIn,
    logOut,
    eShowModalAddPost,
    eShowModalEditPost,
    closeWindow,
    eShowMorePhotoPosts,
    filterByAuthor,
    filterByDate,
    filterByHashtags,
    eToMain
  };
}());
