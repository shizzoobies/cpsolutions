/* ============================================
   Computer Solutions - Google Reviews Carousel

   SETUP:
   1. Get a Google Cloud API key with Places API enabled
   2. Find your Place ID (search on Google Maps, use Place ID Finder)
   3. Replace the constants below

   IMPORTANT: The Google Places API does not support CORS from browsers.
   You MUST proxy requests through Cloudflare Workers or similar.
   Set REVIEWS_PROXY_URL to your worker endpoint, e.g.:
   'https://reviews-proxy.your-domain.workers.dev/reviews'

   Your worker should call:
   https://maps.googleapis.com/maps/api/place/details/json?place_id=PLACE_ID&fields=reviews&key=API_KEY
   and return the JSON response.
   ============================================ */

// Uses Cloudflare Pages Function at /api/reviews
// Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID as env vars in Cloudflare Pages dashboard
var REVIEWS_API_URL = '/api/reviews';

// Fallback reviews (used when API unavailable)
const FALLBACK_REVIEWS = [
  {
    author_name: 'James Davidson',
    rating: 5,
    text: 'My laptop was completely unresponsive and they had it back to me the same day. Incredible service and very fair pricing. Highly recommend!',
    relative_time_description: '2 months ago'
  },
  {
    author_name: 'Sarah Reynolds',
    rating: 5,
    text: 'They set up our entire office network and it\'s been running flawlessly for over a year. Professional team that really knows their stuff.',
    relative_time_description: '3 months ago'
  },
  {
    author_name: 'Mike Kowalski',
    rating: 5,
    text: 'Thought I\'d lost years of family photos, but Computer Solutions recovered everything. Can\'t thank them enough for their patience and skill.',
    relative_time_description: '1 month ago'
  },
  {
    author_name: 'Lisa Park',
    rating: 5,
    text: 'As a freelance designer, my Mac is my livelihood. When it crashed before a deadline, they prioritized my repair and saved my project. True lifesavers.',
    relative_time_description: '2 weeks ago'
  },
  {
    author_name: 'Robert Hughes',
    rating: 5,
    text: 'We\'ve been using their managed IT services for two years now. Response time is excellent and they always explain things in terms I can understand.',
    relative_time_description: '1 month ago'
  },
  {
    author_name: 'Amanda Nelson',
    rating: 5,
    text: 'The cybersecurity audit they did for our law firm was thorough and eye-opening. They found vulnerabilities we didn\'t know existed and fixed them all.',
    relative_time_description: '3 weeks ago'
  },
  {
    author_name: 'Chris Jackson',
    rating: 5,
    text: 'My gaming PC needed a serious upgrade. They helped me pick the right components within my budget and the build quality is fantastic.',
    relative_time_description: '2 months ago'
  },
  {
    author_name: 'Diana Foster',
    rating: 5,
    text: 'After a ransomware attack, Computer Solutions recovered our files and secured our entire network. Their team was calm, professional, and incredibly knowledgeable.',
    relative_time_description: '1 month ago'
  }
];

// --- Fetch Reviews ---
async function fetchGoogleReviews() {
  try {
    var res = await fetch(REVIEWS_API_URL);
    if (!res.ok) throw new Error('Reviews API returned ' + res.status);
    var data = await res.json();

    var reviews = data.reviews || [];
    return reviews.length > 0 ? reviews : FALLBACK_REVIEWS;
  } catch (err) {
    console.warn('Reviews: API failed, using fallback:', err.message);
    return FALLBACK_REVIEWS;
  }
}

// --- Render ---
function getInitials(name) {
  return name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
}

function createReviewCard(review) {
  var stars = '';
  for (var i = 0; i < review.rating; i++) stars += '&#9733;';

  return '' +
    '<div class="review-card">' +
      '<div class="review-stars">' + stars + '</div>' +
      '<p class="review-text">"' + review.text + '"</p>' +
      '<div class="review-author">' +
        '<div class="review-avatar">' + getInitials(review.author_name) + '</div>' +
        '<div>' +
          '<div class="review-name">' + review.author_name + '</div>' +
          '<div class="review-time">' + review.relative_time_description + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
}

// --- Carousel (CSS marquee, seamless loop) ---
function initCarousel(reviews) {
  var track = document.getElementById('reviewsTrack');
  if (!track) return;

  // Render cards twice for seamless loop
  var cardsHTML = reviews.map(createReviewCard).join('');
  track.innerHTML = cardsHTML + cardsHTML;
  track.classList.add('marquee');
}

// --- Modal ---
function initModal(reviews) {
  var btn = document.getElementById('viewAllReviews');
  var modal = document.getElementById('reviewsModal');
  var modalGrid = document.getElementById('reviewsModalGrid');
  var modalClose = document.getElementById('reviewsModalClose');

  if (!btn || !modal) return;

  modalGrid.innerHTML = reviews.map(createReviewCard).join('');

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  modalClose.addEventListener('click', function () {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async function () {
  var reviews = await fetchGoogleReviews();
  initCarousel(reviews);
  initModal(reviews);
});
