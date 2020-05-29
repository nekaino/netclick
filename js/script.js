	// elements
		// menu
const leftMenu = document.querySelector('.left-menu'),
	hamburger = document.querySelector('.hamburger'),
	dropdown = document.querySelectorAll('.dropdown'),
		// cards
	tvShowsList = document.querySelector('.tv-shows__list'),
	tvShows = document.querySelector('.tv-shows'),
	tvCardImg = document.querySelector('.tv-card__img'),
	tvShowsHead = document.querySelector('.tv-shows__head'),
		// modal window
	modal = document.querySelector('.modal'),
	modalTitle = document.querySelector('.modal__title'),
	imageContent = document.querySelector('.image__content'),
	genresList = document.querySelector('.genres-list'),
	rating = document.querySelector('.rating'),
	description = document.querySelector('.description'),
	modalLink = document.querySelector('.modal__link'),
		// search
	searchForm = document.querySelector('.search__form'),
	searchFormInput = document.querySelector('.search__form-input'),
	IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2',
		// more
	pagination = document.querySelector('.pagination');



const loading = document.createElement('div');
loading.className = 'loading';

const preload = document.querySelector('.preloader');


const DBServise = class {

	constructor(){
		this.SERVER = 'https://api.themoviedb.org/3';
		this.API_KEY = 'cf35eff89baefbc910d7863d12af441e';
	}

	getData = async (url) => {
		const res = await fetch(url);
		if (res.ok) {
			return res.json();
		} else {
			throw new Error(`Error data ${url}`);
		};
	};

	getTestData = async () => await this.getData('test.json');

	getTestCard = () => this.getData('card.json');

	getSearchResult = query => {
		this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`;
		return this.getData(this.temp)
	}
	
	getNextPage = page => {
		return this.getData(this.temp + '&page' + page);
	}

	getTvShow = id => this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
	
	getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);
	getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);
	getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);
	getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
};

	// append card with SQL/DB
const renderCard = (response, target) => {
	tvShowsList.textContent = '';
	if (!response.total_results) {
		loading.remove();
		tvShowsHead.textContent = 'По вашему запросу ничего не найдено!';
		tvShowsHead.style.color = 'red';
		return;
	}

	tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
	tvShowsHead.style.color = 'black';
	response.results.forEach(item => {


		const {
			backdrop_path: backdrop,
			name: title,
			poster_path: poster,
			vote_average: vote
		} = item;

		const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
		const backdropIMG = backdrop ? IMG_URL + backdrop : '';
		
		const voteElem = vote ? vote : '';
		const voteVis = !voteElem ? '' :`<span class="tv-card__vote">${voteElem}</span>`;


		const card = document.createElement('li');
		card.className = 'tv-shows__item';
		card.innerHTML = `
							<a href="#" id="${item.id}" class="tv-card">
								${voteVis}
								<img class="tv-card__img"
										src="${posterIMG}"
										data-backdrop="${backdropIMG}"
										alt="${title}">
								<h4 class="tv-card__head">${title}</h4>
							</a>
						`;
		loading.remove();
		tvShowsList.append(card);
	});	

	pagination.textContent = '';

	if (!target && response.total_pages > 1) {
		for (let i = 1; i <= response.total_pages; i++) {
			pagination.innerHTML += `<li><a href="#" class="pages"></a>${i}</li>`;
		}
	}
}; 

	// search and add card
searchForm.addEventListener('submit', event => {
	event.preventDefault();
	const value = searchFormInput.value.trim();
	searchFormInput.value = '';
	if (value) {
		tvShows.append(loading);
		new DBServise().getSearchResult(value).then(renderCard);
	};
});



	// open/closed menu

const closeDropdown = () => {
	dropdown.forEach(item => {
		item.classList.remove('active');
	})
}

hamburger.addEventListener('click', () => {
	leftMenu.classList.toggle('openMenu');
	hamburger.classList.toggle('open');
	closeDropdown();
});

document.addEventListener('click', (event) => {
	if (!event.target.closest('.left-menu')) {
		leftMenu.classList.remove('openMenu');
		hamburger.classList.remove('open');
		closeDropdown();
	};
});

leftMenu.addEventListener('click', event => {
	event.preventDefault();
	const target = event.target;
	const dropdown = target.closest('.dropdown');
	if (dropdown) {
		dropdown.classList.toggle('active');
		leftMenu.classList.add('openMenu');
		hamburger.classList.add('open');
	};

	if (target.closest('#top-rated')) {
		new DBServise().getTopRated().then((response) => renderCard(response, target));
	}

	if (target.closest('#popular')) {
		new DBServise().getPopular().then((response) => renderCard(response, target));
	}

	if (target.closest('#week')) {
		new DBServise().getToday().then((response) => renderCard(response, target));
	}

	if (target.closest('#today')) {
		new DBServise().getWeek().then((response) => renderCard(response, target));
	}

	if (target.closest('#search')) {
		tvShowsList.textContent = '';
		tvShowsHead.textContent = '';
	}
});

	// open modal window
tvShowsList.addEventListener('click', enent => {
	event.preventDefault();
	const target = enent.target;
	const card = target.closest('.tv-card');
	
	if (card) {

		preload.style.display = 'block';

		new DBServise().getTvShow(card.id)
			.then(({ poster_path: posterPath, name: title, genres, vote_average: vote, overview, homepage }) => {
				const posterIMG = posterPath ? IMG_URL + posterPath : 'img/no-poster.jpg';
				tvCardImg.src = posterIMG;
				tvCardImg.alt = title;
				modalTitle.textContent = title;
					// genresList.innerHTML = response.genres.reduce((acc, item) =>  `${acc}<li>${item.name}</li>`, '');
				genresList.textContent = '';
				for (const item of genres) {
					genresList.innerHTML += `<li>${item.name}</li>`;
				};
				rating.textContent = vote;
				description.textContent = overview;
				modalLink.href = homepage;
			})
			.then(() => {
				document.body.style.overflow = 'hidden';
				modal.classList.remove('hide');
			})
			.finally(() => {
				preload.style.display = '';
			})

		
	};
});
	
	// close modal window
modal.addEventListener('click', event => {
	const button = event.target.closest('.cross');
	const background = event.target.classList.contains('modal');
	
	if (button || background) {
		document.body.style.overflow = '';
		modal.classList.add('hide');
	};
});


	// switch card image
const changeImage = event => {
	const card = event.target.closest('.tv-shows__item');

	if (card) {
		const img = card.querySelector('.tv-card__img');
		if (img.dataset.backdrop) {
			[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
		};
	};
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', event => {
	event.preventDefault();
	const target = event.target;

	if (target.classList.contains('pages')) {
		
		new DBServise().getNextPage(target.textContent).then(renderCard);
	}
})