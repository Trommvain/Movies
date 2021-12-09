
async function getMovies(page) {
  const url = new URL ('http://api.themoviedb.org/3/movie/now_playing?api_key=ebea8cfca72fdff8d2624ad7bbf78e4c');
  url.searchParams.append('page', page);
  let movies;
  const response = await fetch(url);
  if (response.ok) movies = await response.json();
    else alert('HTTP error: ' + response.status);
  
  const movieBlock = document.querySelector('main');

  for (let i = 0; i < movies.results.length; i++) {
    let pic = document.createElement("img");
    if (!movies.results[i].poster_path) pic.src = 'pictures/no_image.png';
      else pic.src = ("http://image.tmdb.org/t/p/w342" + movies.results[i].poster_path);
    pic.title = movies.results[i].title;
    pic.className = 'movie-pic';
    pic.dataset.movieId = movies.results[i].id;
        
    movieBlock.append(pic);
    pic.onclick = detailModalWindow;
  }

  document.body.scrollTop = 0;

  const pagination = document.getElementsByClassName('pagination')[0];
  pagination.style.visibility = 'visible';
  const loading = document.querySelector('.placeholder');
  loading.style.display = 'none';

  document.querySelector('.my-account-btn').onclick = myFavorite;

  //Tooltip

  let tooltip;
  let titleCache;
  let anchorElem;

  document.onmouseover = (event) => {
    anchorElem = event.target.closest('img');
    if ( !anchorElem || !anchorElem.title) return;
    tooltip = showTooltip(anchorElem, anchorElem.title);
    titleCache = anchorElem.title;
    anchorElem.removeAttribute('title');
  }

  document.onmouseout = () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = false;
    }
    if (!anchorElem) return;
    anchorElem.setAttribute('title', titleCache);
    titleCache = '';
  }

  function showTooltip(anchorElem, title) {
    let tooltipElem = document.createElement('div');
    tooltipElem.className = 'tooltip';
    tooltipElem.textContent = title;
    document.body.append(tooltipElem);

    let coords = anchorElem.getBoundingClientRect();

    let left = coords.left + (anchorElem.offsetWidth - tooltipElem.offsetWidth) / 2;
    if (left < 0) left = 0;

    let bottom = coords.bottom - tooltipElem.offsetHeight + 15;
    if (bottom < 0) {
      bottom = coords.bottom + anchorElem.offsetHeight + 5;
    }

    tooltipElem.style.left = left + 'px';
    tooltipElem.style.top = bottom + 'px';

    return tooltipElem;
  }

  //Pagination handler

  const first = document.getElementById('first');
  const prev = document.getElementById('prev');
  const ellipsisFirst = document.getElementById('ellipsis-first');
  const firstCell = document.getElementById('first-cell');
  const secondCell = document.getElementById('second-cell');
  const thirdCell = document.getElementById('third-cell');
  const ellipsisLast = document.getElementById('ellipsis-last');
  const next = document.getElementById('next');
  const last = document.getElementById('last');

  function clearMovies() {
    const movieBlock = document.querySelectorAll('main img');
    for (let i = 0; i < movieBlock.length; i++) {
      movieBlock[i].remove();
    }
    const pagination = document.getElementsByClassName('pagination')[0];
    pagination.style.visibility = 'hidden';
    const loading = document.querySelector('.placeholder');
    loading.style.display = '';
  }

  function showFirst() {
    ellipsisFirst.style.display = '';
    first.style.display = '';
    prev.style.display = '';
  }

  function hideFirst() {
    ellipsisFirst.style.display = 'none';
    first.style.display = 'none';
    prev.style.display = 'none';
  }

  function showLast() {
    ellipsisLast.style.display = '';
    next.style.display = '';
    last.style.display = '';
  }

  function hideLast() {
    ellipsisLast.style.display = 'none';
    next.style.display = 'none';
    last.style.display = 'none';
  }

  function setSelected(cell) {
    const selected = document.querySelectorAll('.selected');
    selected.forEach(n => n.classList.remove('selected'));
    cell.classList.add('selected');
  }

  function getSelected() {
    const selected = document.querySelector('.selected');
    return selected.id;
  }

  if (page == 1) {
    hideFirst();
    setSelected(firstCell);
  }
  
  pagination.onclick = (event) => {
    let cell = event.target;
    switch (cell.id) {
      case 'first': { 
        if (page == 1) break;
          else {
            page = 1;
            clearMovies(); 
            getMovies(page);
            showLast();
            firstCell.textContent = page;
            secondCell.textContent = page + 1;
            thirdCell.textContent = page + 2;
            setSelected(firstCell);
            break;
          }
        }
      case 'prev': {
        if (page == 1) {
          hideFirst();
          break;
        }
          else if (getSelected() == 'first-cell' && firstCell.textContent == '2'){
            page = 1;
            clearMovies();
            getMovies(page);
            hideFirst();
            setSelected(firstCell);
            firstCell.textContent = page;
            secondCell.textContent = page + 1;
            thirdCell.textContent = page + 2;
            break;
          }
            else {
              showLast();
              page -= 1;
              clearMovies();
              getMovies(page);
              let currentCell = getSelected();
              switch(currentCell) {
                case 'third-cell': {
                  setSelected(secondCell);
                  break;
                }
                case 'second-cell': {
                  setSelected(firstCell); 
                  break;
                }
                case 'first-cell': {
                  setSelected(thirdCell);
                  firstCell.textContent = page - 2;
                  secondCell.textContent = page - 1;
                  thirdCell.textContent = page;
                  break;
                }
              }
              break;
            }
      }
      case 'first-cell': {
        page = +firstCell.textContent;
        if ( ( (page + 2) == movies.total_pages) || ( (page + 3) == movies.total_pages)) showLast();
        if (page == 1 && getSelected() == 'first-cell') break;
        else if (page == 1) {
          clearMovies();
          getMovies(page);
          hideFirst();
          firstCell.textContent = page;
          secondCell.textContent = page + 1;
          thirdCell.textContent = page + 2;
        }
          else {
            clearMovies();
            getMovies(page);
            setSelected(secondCell);
            firstCell.textContent = page - 1;
            secondCell.textContent = page;
            thirdCell.textContent = page + 1;
          }
        break;
      }
      case 'second-cell': {
        page = +secondCell.textContent;
        clearMovies();
        getMovies(page);
        setSelected(secondCell);
        firstCell.textContent = page - 1;
        thirdCell.textContent = page + 1;
        break;
      }
      case 'third-cell': {
        page = +thirdCell.textContent;
        if (page == movies.total_pages && getSelected() == 'third-cell') break;
          else if (page == movies.total_pages) {
            hideLast();
            setSelected(thirdCell);
            clearMovies();
            getMovies(page);
            firstCell.textContent = page - 2;
            secondCell.textContent = page - 1;
            thirdCell.textContent = page;
          }
            else {
              showFirst();
              setSelected(secondCell);
              clearMovies();
              getMovies(page);
              firstCell.textContent = page - 1;
              secondCell.textContent = page;
              thirdCell.textContent = page + 1;
            }
          break;
        }
      case 'next': {
        if (page == movies.total_pages) {
          hideLast();
          break;
        }
        if (page == movies.total_pages - 1) {
          hideLast();
          clearMovies();
          getMovies(page += 1);
          firstCell.textContent = movies.total_pages - 2;
          secondCell.textContent = movies.total_pages - 1;
          thirdCell.textContent = movies.total_pages;
          break;
        }
        if (page == 2) showFirst();
        page += 1;
        clearMovies();
        getMovies(page);
        let currentCell = getSelected();
        switch(currentCell) {
          case 'first-cell': {
            setSelected(secondCell);
            break;
          }
          case 'second-cell': {
            setSelected(thirdCell); 
            break;
          }
          case 'third-cell': {
            setSelected(firstCell);
            firstCell.textContent = page;
            secondCell.textContent = page + 1;
            thirdCell.textContent = page +2;
            break;
          }
        }
        if (page == movies.total_pages) hideLast();
        break;
      }
      case 'last': {
        if (page == movies.total_pages) break;
          else {
            page = movies.total_pages;
            clearMovies(); 
            getMovies(page);
            firstCell.textContent = page - 2;
            secondCell.textContent = page - 1;
            thirdCell.textContent = page;
            showFirst();
            hideLast();
            setSelected(thirdCell);
            break;
          }
      }
    }
  }

  //Detail modal window handler

  let modalMovieInfo;
  let moviePic;
  let movieNumber;
  let lastNumber;
  let favoriteMovies;
  
  document.querySelector('.back-arrow').onclick = backToList;
  document.querySelector('.back-arrow-mobile').onclick = backToList;
  document.querySelector('.next-arrow').onclick = nextMovie;
  document.querySelector('.next-arrow-mobile').onclick = nextMovie;
  
  function detailModalWindow (event) {
    let movieId = event.target.dataset.movieId;
    for (let i = 0; i < movies.results.length; i++) {
      if (movies.results[i].id != movieId) continue;
        else {
        modalMovieInfo = movies.results[i];
        movieNumber = i;
        lastNumber = movies.results.length - 1;
        break;
      }
    }
    displayModal(modalMovieInfo);
  }

  function displayModal (modalMovieInfo) {
    document.querySelector('main').style.display = 'none';
    document.querySelector('.pagination').style.display = 'none';
    document.querySelector('.section-name').style.display = 'none';
    const modalBackdrop = document.querySelector('.detail-modal-backdrop');
    if (modalMovieInfo.backdrop_path) {
    modalBackdrop.style.cssText = `
      display: block;
      background-image: url(http://image.tmdb.org/t/p/w342${modalMovieInfo.backdrop_path});
      filter: blur(15px) brightness(40%);
    `;
    }
      else {
        modalBackdrop.style.cssText = `
        display: block;
        background: linear-gradient(45deg, rgb(54, 97, 138), rgb(34, 66, 94));
        `;
      }
    document.querySelector('.detail-modal').style.display = 'block';

    if (checkMovie()) document.querySelector('.favorite-btn').style.display = 'none';
      else document.querySelector('.favorite-btn').style.display = '';

    if (checkMovie()) document.querySelector('.favorite-btn-mobile').style.display = 'none';
      else document.querySelector('.favorite-btn-mobile').style.display = '';

    moviePic = document.createElement('img');
    if (!modalMovieInfo.poster_path) moviePic.src = 'pictures/no_image.png';
      else moviePic.src = ('http://image.tmdb.org/t/p/w342' + modalMovieInfo.poster_path);
    moviePic.dataset.id = modalMovieInfo.id;
    document.querySelector('.modal-pic').append(moviePic);
    const releaseDate = modalMovieInfo.release_date.substr(0, 4);
    const rating = !modalMovieInfo.adult ? 'PG-13' : 'R';

    function getReleaseDate() {
      const date = modalMovieInfo.release_date;
      let month = date.substr(5, 2);
      switch (month) {
        case '01': { month = 'January'; break; }
        case '02': { month = 'February'; break; }
        case '03': { month = 'March'; break; }
        case '04': { month = 'April'; break; }
        case '05': { month = 'May'; break; }
        case '06': { month = 'June'; break; }
        case '07': { month = 'July'; break; }
        case '08': { month = 'August'; break; }
        case '09': { month = 'September'; break; }
        case '10': { month = 'October'; break; }
        case '11': { month = 'November'; break; }
        case '12': { month = 'December'; break; }
      };
      let day = date.substr(8, 2);
      day = day.substr(0, 1) == 0 ? day.substr(1, 1) : day.substr(0, 2);
      const year = date.substr(0, 4);
      return (month + ' ' + day + ', ' + year);
    }
    
    document.querySelector('.text.title').textContent = modalMovieInfo.title + ' (' + releaseDate + ')';
    document.querySelector('.mobile-title').textContent = modalMovieInfo.title + ' (' + releaseDate + ')';
    document.querySelector('.text.info.score.value').textContent = modalMovieInfo.vote_average;
    document.querySelector('.text.info.rating.value').textContent = rating;
    document.querySelector('.text.info.date.value').textContent = getReleaseDate();
    if (modalMovieInfo.overview.trim() != '') {
      document.querySelector('.text.description').textContent = modalMovieInfo.overview;
      document.querySelector('.mobile-description').textContent = modalMovieInfo.overview;
    }
      else {
        document.querySelector('.text.description').textContent = '';
        document.querySelector('.mobile-description').textContent = '';
        const lines = document.querySelectorAll('.modal-info hr');
        for (let i = 0; i < lines.length; i++) lines[i].style.visibility = 'hidden';
        const mobileLines = document.querySelectorAll('.mobile-hr');
        for (let i = 0; i < mobileLines.length; i++) mobileLines[i].style.visibility = 'hidden';
      }
  
    if (movieNumber == lastNumber) {
      document.querySelector('.next-text').style.visibility = 'hidden';
      document.querySelector('.next-text-mobile').style.visibility = 'hidden';
      document.querySelector('.next-arrow').style.visibility = 'hidden';
      document.querySelector('.next-arrow-mobile').style.visibility = 'hidden';
    }
    if (document.querySelectorAll('.modal-pic > img').length != 1) document.querySelector('.modal-pic > img').remove();
  }

    function backToList() {
      document.querySelector('.my-account-btn').style.visibility = '';
      document.querySelector('main').style.display = '';
      document.querySelector('.pagination').style.display = '';
      document.querySelector('.section-name').style.display = '';
      document.querySelector('.detail-modal').style.display = '';
      document.querySelector('.detail-modal-backdrop').style.display = '';

      moviePic.remove();

      const lines = document.querySelectorAll('.modal-info hr');
      for (let i = 0; i < lines.length; i++) lines[i].style.visibility = 'visible';
      document.querySelector('.next-text').style.visibility = 'visible';
      document.querySelector('.next-text-mobile').style.visibility = 'visible';
      document.querySelector('.next-arrow').style.visibility = 'visible';
      document.querySelector('.next-arrow-mobile').style.visibility = 'visible';
      if (favoriteMovieFlag) {
        document.querySelector('main').style.display = '';
        document.querySelector('.pagination').style.display = '';
        document.querySelector('.section-name').style.display = '';
        document.querySelector('.my-favorite').style.display = 'block';
        document.querySelector('.my-account-backdrop').style.display = 'block';
        favoriteMovieFlag = false;
      }
    }

    function nextMovie() {
      if (checkMovie()) document.querySelector('.favorite-btn').style.display = 'none';
        else document.querySelector('.favorite-btn').style.display = '';
      if (checkMovie()) document.querySelector('.favorite-btn-mobile').style.display = 'none';
        else document.querySelector('.favorite-btn-mobile').style.display = '';

      if (favoriteMovieFlag) modalMovieInfo = favoriteMovies[++movieNumber]
        else modalMovieInfo = movies.results[++movieNumber];

      moviePic.remove();

      if (movieNumber == lastNumber) {
        document.querySelector('.next-text').style.visibility = 'hidden';
        document.querySelector('.next-text-mobile').style.visibility = 'hidden';
        document.querySelector('.next-arrow').style.visibility = 'hidden';
        document.querySelector('.next-arrow-mobile').style.visibility = 'hidden';
      }

      displayModal(modalMovieInfo);
    }

  //My account, favorite movies
  
  let favoriteMovieFlag;

  function myFavorite() {
    const myFavoriteBlock = document.querySelector('.my-favorite');
    const myAccountBackdrop = document.querySelector('.my-account-backdrop');
    const movieBlock = document.querySelector('main');
    
    if (myFavoriteBlock.style.display == '') {
      myFavoriteBlock.style.display = 'block';
      myAccountBackdrop.style.display = '';
      movieBlock.style.display = 'none';
    }
      else {
        myFavoriteBlock.style.display = '';
        if(document.querySelector('.detail-modal').style.display == '') movieBlock.style.display = '';
        favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies"));
        let modalId = document.querySelector('.modal-pic img');
        if (modalId != null) modalId = modalId.dataset.id;
        for (let i = 0; i < favoriteMovies.length; i++) {
          if (favoriteMovies[i].id == modalId) {
            document.querySelector('.favorite-btn').style.display = 'none';
            document.querySelector('.favorite-btn-mobile').style.display = 'none';
          }
        }
      }

    myAccountBackdrop.style.display = myAccountBackdrop.style.display == '' ? 'block' : '';

    displayFavoriteMovies();

  }

  document.querySelector('.favorite-btn').onclick = addMovie;
  document.querySelector('.favorite-btn-mobile').onclick = addMovie;

  function addMovie() {
    favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies") || '[]');
    localStorage.setItem("movie", JSON.stringify(modalMovieInfo));
    favoriteMovies.push(modalMovieInfo);
    localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
    document.querySelector('.favorite-btn').style.display = 'none';
    document.querySelector('.favorite-btn-mobile').style.display = 'none';
  }

  function checkMovie() {
    favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies"));
    if(favoriteMovies.length == 0 || favoriteMovies == null) return false;
      else {
        for (let i = 0; i < favoriteMovies.length; i++) {
          if (modalMovieInfo.id == favoriteMovies[i].id) return true;
        }
        return false;
      }
  }

  function deleteMovie(event) {
    favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies"));
    for (let i = 0; i < favoriteMovies.length; i++) {
      if (favoriteMovies[i].id == event.target.dataset.id) {
        const index = favoriteMovies.indexOf(favoriteMovies[i]);
        favoriteMovies.splice(index, 1);
        localStorage.setItem("favoriteMovies", JSON.stringify(favoriteMovies));
      }
    }
    displayFavoriteMovies();
    document.querySelector('.favorite-btn').style.display = '';
    document.querySelector('.favorite-btn-mobile').style.display = '';
  }

  function displayFavoriteMovies() {
    let pic;
    let movieBlock = document.querySelectorAll('.my-favorite > div');
    for (let i = 0; i < movieBlock.length; i++) movieBlock[i].remove();
    
    favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies"));
    if (favoriteMovies.length == 0) {
      document.querySelector('.my-favorite > .placeholder').style.display = 'block';
      return;
    }
    document.querySelector('.my-favorite > .placeholder').style.display = 'none';
    for (let i = 0; i < favoriteMovies.length; i++) {
      let movieDescription = (!favoriteMovies[i].overview || favoriteMovies[i].overview == ' ') ? '<em>No description</em>' : favoriteMovies[i].overview;
      let movieCard = document.createElement('div');
      if (!favoriteMovies[i].poster_path) pic = 'pictures/no_image.png';
      else pic = "http://image.tmdb.org/t/p/w342" + favoriteMovies[i].poster_path;
      movieCard.className = 'movie-card';
      movieCard.innerHTML = `
        <img class="favorite-movie-pic" src="${pic}" alt="${favoriteMovies[i].title}" data-id = "${favoriteMovies[i].id}">
        <div class="favorite-movie-info">
          <h2>${favoriteMovies[i].title}</h2>
          <div class="unfavorite-btn" data-id = "${favoriteMovies[i].id}">Unfavorite</div>
          <p>${movieDescription}</p>
        </div>
      `;
      document.querySelector('.my-favorite').append(movieCard);
      document.querySelectorAll('.favorite-movie-pic')[i].onclick = favoriteModal;
    }

    let buttons = document.querySelectorAll('.unfavorite-btn');
    for (let i = 0; i < buttons.length; i++) buttons[i].onclick = deleteMovie;
  }

  function favoriteModal(event) {
    favoriteMovieFlag = true;
    document.querySelector('.my-account-btn').style.visibility = 'hidden';
    document.querySelector('.my-favorite').style.display = '';
    document.querySelector('.my-account-backdrop').style.display = '';
    let movieId = event.target.dataset.id;
    favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies"));
    for (let i = 0; i < favoriteMovies.length; i++) {
      if (favoriteMovies[i].id != movieId) continue;
      else {
        modalMovieInfo = favoriteMovies[i];
        movieNumber = i;
        lastNumber = favoriteMovies.length - 1;
        break;
      }
    }

    displayModal(modalMovieInfo);
  }
 
}

getMovies(1);



