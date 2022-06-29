"use strict";

const $showsList = $("#shows-list");
const $episodesList = $("#episodes-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${term}`,
    { params: { q: term } }
  );

  return response.data.map((result) => {
    return {
      id: result.show.id,
      name: result.show.name,
      summary: result.show.summary,
      image: result.show.image
        ? result.show.image.medium
        : "https://tinyurl.com/missing-tv",
    };
  });
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-secondary btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);

    // add listener on Episodes button
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );

  return response.data.map((result) => {
    return {
      id: result.id,
      name: result.name,
      season: result.season,
      number: result.number,
    };
  });
}

/** Given list of episodes, create markup for each and add to DOM */

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
      `<li>
      S${episode.season}:E${episode.number} - ${episode.name}
       </li>`
    );

    $episodesList.append($episode);
  }

  $episodesArea.show();
}

/** Handle click on Episodes button to trigger getEpisodesOfShow and populateEpisodes */

async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest("[data-show-id]").data("show-id");

  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", getEpisodesAndDisplay);
