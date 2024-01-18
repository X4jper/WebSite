document.addEventListener('DOMContentLoaded', function () {
    const overlay = document.getElementById('overlay');
    const addArticleBtn = document.getElementById('add-article-btn');
    const articleForm = document.getElementById('article-form');
    const publishBtn = document.getElementById('publish-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const podgladBtn = document.getElementById('podglad-btn');
    const articleTitleInput = document.getElementById('article-title');
    const articleContentInput = document.getElementById('article-content');
    const articleImageInput = document.getElementById('article-image');
    const previewSection = document.getElementById('preview-section');
    const mainArticleSection = document.getElementById('main-article');
    const tagOptionsContainer = document.getElementById('tag-options');
    const tagCheckboxes = document.getElementById('tag-checkboxes');
    const tagCheckboxesBtn = document.getElementById('tag-checkboxes-btn');

    const articleTags = document.querySelectorAll('#article-tags li a');

    const maxWidth = 250;
    const maxHeight = 250;

    articleTags.forEach(tag => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'tag-' + tag.textContent.toLowerCase();
        checkbox.value = tag.textContent.toLowerCase();
    
        const label = document.createElement('label');
        label.setAttribute('for', 'tag-' + tag.textContent.toLowerCase());
        label.textContent = tag.textContent;
    
        tagOptionsContainer.appendChild(checkbox);
        tagOptionsContainer.appendChild(label);
    });

    articleTitleInput.addEventListener('input', updatePreview);
    articleContentInput.addEventListener('input', updatePreview);
    articleImageInput.addEventListener('change', updatePreview);

    podgladBtn.addEventListener('click', function () {
        overlay.style.display = 'block';
        previewSection.style.display = 'block';
    });

    addArticleBtn.addEventListener('click', function () {
        overlay.style.display = 'block';
        articleForm.style.display = 'block';
    });

    overlay.addEventListener('click', function () {
        overlay.style.display = 'none';
        articleForm.style.display = 'none';
        previewSection.style.display = 'none';
    });

    cancelBtn.addEventListener('click', function () {
        overlay.style.display = 'none';
        articleForm.style.display = 'none';
        previewSection.style.display = 'none';
    });

    publishBtn.addEventListener('click', function () {
        const verificationCode = document.getElementById('verification-code').value;
        if (verificationCode !== '8716A4') {
            notify('Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie.', 'error');
            return;
        }

        const selectedTags = Array.from(document.querySelectorAll('#tag-options input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        const articleTitle = articleTitleInput.value;
        const articleContent = articleContentInput.value;
        const articleTags = selectedTags.join(', ');
        const articleImage = articleImageInput.files[0];

        if (!articleTitle || !articleContent || !articleTags || !articleImage) {
            notify('Wypełnij wszystkie wymagane pola (tytuł, opis, tagi, zdjęcie, kod).', 'error');
            return;
        }

        const currentDate = new Date();
        const hours = currentDate.getHours().toString().padStart(2, '0');
        const minutes = currentDate.getMinutes().toString().padStart(2, '0');
        const seconds = currentDate.getSeconds().toString().padStart(2, '0');
        const formattedDate = `${hours}:${minutes}:${seconds}`;

        if (articleImage) {
            const image = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            image.src = URL.createObjectURL(articleImage);

            image.onload = function () {
                let newWidth = image.width;
                let newHeight = image.height;

                if (image.width > maxWidth || image.height > maxHeight) {
                    const aspectRatio = image.width / image.height;

                    if (image.width > maxWidth) {
                        newWidth = maxWidth;
                        newHeight = maxWidth / aspectRatio;
                    }

                    if (newHeight > maxHeight) {
                        newHeight = maxHeight;
                        newWidth = maxHeight * aspectRatio;
                    }
                }

                canvas.width = newWidth;
                canvas.height = newHeight;

                ctx.drawImage(image, 0, 0, newWidth, newHeight);

                clearFormInputs(selectedTags);
                appendNewArticle(articleTitle, articleContent, selectedTags, canvas.toDataURL('image/jpeg'), formattedDate);

                notify('Artykuł opublikowany!', 'success');
            };
        } else {
            clearFormInputs(selectedTags);
            appendNewArticle(articleTitle, articleContent, selectedTags, null, formattedDate);

            notify('Artykuł opublikowany!', 'success');
        }
    });

    tagCheckboxesBtn.addEventListener('click', function () {
        tagCheckboxes.style.display = tagCheckboxes.style.display === 'none' ? 'block' : 'none';
    });

    tagOptionsContainer.addEventListener('change', function () {
        updatePreview();
    });

    function updatePreview() {
        const title = articleTitleInput.value;
        const content = articleContentInput.value;
        const tags = Array.from(document.querySelectorAll('#tag-options input[type="checkbox"]:checked'))
            .map(checkbox => "#" + checkbox.value)
            .join(', ');
        const image = articleImageInput.files[0];

        const previewHTML = `
            <h3>${title}</h3>
            <p>${content}</p>
            <p>Tagi: ${tags}</p>
            ${image ? `<img src="${URL.createObjectURL(image)}" alt="ZDJĘCIE">` : ''}
        `;

        previewSection.innerHTML = previewHTML;
    }

    function notify(message, type) {
        const notificationSection = document.getElementById('notification-section');
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;
        notification.innerHTML = message;

        notification.style.animation = 'fadeInOut 3s ease-in-out';

        notificationSection.appendChild(notification);

        setTimeout(function () {
            notification.remove();
        }, 5000);
    }

    function clearFormInputs(selectedTags) {
        articleTitleInput.value = '';
        articleContentInput.value = '';
        articleImageInput.value = '';
        selectedTags.forEach(tag => {
            document.getElementById('tag-' + tag).checked = false;
        });

        overlay.style.display = 'none';
        articleForm.style.display = 'none';
        previewSection.style.display = 'none';
    }

    const sportsCategories = document.querySelectorAll('.nav-sports-categories a');
    sportsCategories.forEach(category => {
        category.addEventListener('click', function (event) {
            event.preventDefault();
            const selectedCategory = category.textContent.toUpperCase();
            const articles = document.querySelectorAll('#main-article div');

            articles.forEach(article => {
                const articleCategories = article.querySelector('p:nth-child(3)').textContent.toUpperCase();

                if (articleCategories.includes(selectedCategory)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    });

    function appendNewArticle(title, content, tags, imageSrc = null, formattedDate) {
        const newArticle = document.createElement('div');
        tags = tags.map(tag => "#" + tag).join(', ');
        newArticle.innerHTML = `
            <h3>${title}</h3>
            <p>${content}</p>
            <p>Tagi: ${tags}</p>
            ${imageSrc ? `<img src="${imageSrc}" alt="ZDJĘCIE">` : ''}
            <p>Data publikacji: ${formattedDate}</p>
            <hr>
        `;

        mainArticleSection.insertBefore(newArticle, mainArticleSection.firstChild);

        const latestArticlesList = document.getElementById('latest-articles-list');
        const articleItems = latestArticlesList.querySelectorAll('li');

        const newArticleItem = document.createElement('li');
        const newArticleLink = document.createElement('a');
        newArticleLink.href = '#';

        newArticleLink.textContent = title;

        newArticleItem.appendChild(newArticleLink);

        latestArticlesList.querySelector('ul').insertBefore(newArticleItem, latestArticlesList.querySelector('ul').firstChild);

        if (articleItems.length >= 3) {
            const oldestArticle = articleItems[2];
            oldestArticle.remove();
        }
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('search-icon').addEventListener('click', function () {
    var searchForm = document.querySelector('.nav-search-form');
    searchForm.classList.toggle('active');
});

document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();

    var searchTerm = document.getElementById('search-input').value.toLowerCase();

    var articles = document.querySelectorAll('.article-link');

    articles.forEach(function (article) {
        var title = article.querySelector('h3 a').textContent.toLowerCase();
        var content = article.querySelector('p').textContent.toLowerCase();

        var allWordsPresent = searchTerm.split(' ').every(function (word) {
            return title.includes(word) || content.includes(word);
        });

        if (allWordsPresent) {
            article.style.display = 'block';
        } else {
            article.style.display = 'none';
        }
    });
});

window.addEventListener('scroll', function () {
    const atTop = window.scrollY === 0;
    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
  
    if (atTop) {
      document.body.classList.add('at-top');
    } else {
      document.body.classList.remove('at-top');
    }
  
    if (atBottom) {
      document.body.classList.add('at-bottom');
    } else {
      document.body.classList.remove('at-bottom');
    }
  });

  document.addEventListener('DOMContentLoaded', function () {
    function handleNewsletterForm(event) {
      event.preventDefault();

      const emailInput = document.querySelector('.newsletter input[type="email"]');
      const emailAddress = emailInput.value;

      if (isValidEmail(emailAddress)) {
        subscribeToNewsletter(emailAddress);
      } else {
        alert('Proszę wprowadzić poprawny adres e-mail.');
      }
    }

    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }

    function subscribeToNewsletter(email) {
      fetch('/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      })
        .then(response => response.json())
        .then(data => {
          alert(data.success || data.error);
        })
        .catch(error => {
          console.error('Błąd:', error);
          alert('Wystąpił błąd podczas subskrypcji newslettera.');
        });
    }

    const newsletterForm = document.querySelector('.newsletter form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', handleNewsletterForm);
    }
  });

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function scrollToArticle(articleId) {
    var articleElement = document.getElementById(articleId);

    if (articleElement) {
        articleElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function zobacz(articleId) {
    scrollToArticle(articleId);

    console.log('Wybrany artykuł:', articleId);

    var currentUrl = window.location.href;

    window.location.href = currentUrl.split('?')[0] + '?artykul=' + articleId;
}

window.onload = function () {
    var currentArticle = getParameterByName('artykul');
    if (currentArticle) {
        document.getElementById(currentArticle).classList.add('selected');

        scrollToArticle(currentArticle);
    }
};

document.addEventListener('DOMContentLoaded', function () {
    const tagLinks = document.querySelectorAll('#article-tags li a');

    tagLinks.forEach(tagLink => {
        tagLink.addEventListener('click', function (event) {
            event.preventDefault();

            const selectedTag = tagLink.textContent.toLowerCase();
            const articles = document.querySelectorAll('#main-article div');

            articles.forEach(article => {
                const articleTags = article.querySelector('p:nth-child(3)').textContent.toLowerCase();

                if (articleTags.includes(selectedTag)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    });
});

function toggleMenu() {
    var overlay = document.getElementById("menu-overlay");
    var menuContainer = document.getElementById("menu-container");
    var menuIcon = document.getElementById("menu-icon");

    if (overlay.style.display === "block" || menuContainer.style.display === "block") {
        overlay.style.display = "none";
        menuContainer.classList.remove("active");
        menuIcon.classList.remove("fa-times");

    } else {
        overlay.style.display = "block";
        menuContainer.classList.add("active");
        menuIcon.classList.add("fa-times");
    }
}

document.getElementById('saveButton').addEventListener('click', function() {
  this.classList.add('clicked');
  setTimeout(() => {
    this.classList.remove('clicked');
  }, 800);
});

let minDuration = 500;
let startTime = Date.now();

function checkImageLoaded(img) {

    let now = Date.now();

    if (now - startTime >= minDuration) {

      img.classList.remove("placeholder");
    } else {

      setTimeout(function() {
        checkImageLoaded(img);
      }, 100);
    }
  }

  let images = document.querySelectorAll("img");

  for (let i = 0; i < images.length; i++) {

    checkImageLoaded(images[i]);
}

function udostepnij(artykulId, event, button) {
    event.stopPropagation();

    var sukcesIcon = button.querySelector('.sukces-icon');

    button.classList.add('clicked');
    setTimeout(function () {
        button.classList.remove('clicked');
    }, 800);

    sukcesIcon.style.opacity = 1;
    setTimeout(function () {
        sukcesIcon.style.opacity = 0;
    }, 1500);

    var currentUrl = window.location.href.split('?')[0] + '?artykul=' + artykulId;

    copyToClipboard(currentUrl);
}

function copyToClipboard(text) {
    var tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
}

document.getElementById('searchInput').addEventListener('input', function() {
    var searchQuery = document.getElementById('searchInput').value;

    document.getElementById('searchResults').innerText = 'Wyniki wyszukiwania dla: ' + searchQuery;
});

function sortArticles(order) {
    var articlesContainer = document.getElementById('main-article');
    var articles = articlesContainer.getElementsByClassName('article-link');

    var options = document.querySelectorAll('#sort-menu .option');
    options.forEach(function (opt) {
      opt.classList.remove('selected');
    });

    event.target.classList.add('selected');

    var sortedArticles = Array.from(articles).sort(function (a, b) {
      var dateA = new Date(a.getAttribute('data-date'));
      var dateB = new Date(b.getAttribute('data-date'));

      if (order === 'newest') {
        return dateB - dateA;
      } else if (order === 'oldest') {
        return dateA - dateB;
      }
    });

    articlesContainer.innerHTML = '';

    sortedArticles.forEach(function (article) {
      articlesContainer.appendChild(article.cloneNode(true));
    });
}

function toggleSortMenu(element) {
    var sortMenu = document.getElementById('sort-menu');
    sortMenu.classList.toggle('active');
    element.classList.toggle('rotate');
}
