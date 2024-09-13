window.addEventListener("DOMContentLoaded", init);

async function init ()
{
  window.APP = new App();
  await window.APP.awake();
}

export default class App
{
  set user (user)
  {
    if (user === null) {
      sessionStorage.removeItem('user');
      return;
    }

    this.lang = user['lang'];
    sessionStorage.setItem('user', JSON.stringify(user));
  }

  set lang (id)
  {
    sessionStorage.setItem('lang', id);
  }
  
  get user ()
  {
    return JSON.parse(sessionStorage.getItem('user'));
  }

  get lang ()
  {
    let lang = this.langSelected;

    if (sessionStorage.getItem('lang') !== null) {
      lang = sessionStorage.getItem('lang');
    }
    
    return parseInt(lang);
  }

  get langSelected ()
  {

    let langHTML = document.querySelector('select[name="lang"]');
    let lang = langHTML.value;

    return lang;
  }

  get isLogged ()
  {
    return this.user !== null;
  }
  
  async awake ()
  {
    this.awakeLogout();
    await this.awakeLangHTML();
    await this.generatePage();
  }

  awakeLogout ()
  {
    if (!this.isLogged) {
      return;
    }

    let logoutHTML = document.querySelector('#logout');
    logoutHTML.addEventListener('click', this.logout.bind(this));
  }
  
  async awakeLangHTML ()
  {
    let languages = await this.loadLanguages();
    let listHTML = document.querySelector('select[name="lang"]');

    for (let language of languages) {
      let optionHTML = document.createElement('option');
      optionHTML.value = language['id'];
      optionHTML.textContent = language['reference'];
      listHTML.appendChild(optionHTML);
    }

    listHTML.value = this.lang;
    
    listHTML.addEventListener('change', () => {
      this.lang = this.langSelected;
      this.translate();
    });
  }

  async loadUsers ()
  {
    let response = await fetch("datas/users.json");
    let users = await response.json();

    return users;
  }

  async loadLanguages ()
  {
    let response = await fetch("datas/languages.json");
    let languages = await response.json();

    return languages;
  }

  async loadTranslations ()
  {
    let response = await fetch("datas/translations.json");
    let translations = await response.json();

    return translations;
  }

  async loadPage (target)
  {
    target = (target === '') ? 'index' : target;
    
    let response = await fetch(`pages/${target}.html`);
    let html = await response.text();

    return html;
  }

  async generatePage ()
  {
    let path = window.location.pathname.substring(1);
    let appHTML = document.querySelector('#app');
    let pageHTML = await this.loadPage(path);

    this.updateHeader();
    this.updateMain(pageHTML);
    await Promise.all([
      this.page(path),
      this.translate()
    ]);
  }

  updateHeader ()
  {
    let headerHTML = document.querySelector('header');
    let loginHTML = document.querySelector('#login');
    let logoutHTML = document.querySelector('#logout');

    if (this.isLogged) {
      loginHTML.style.display = 'none';
      logoutHTML.style.display = 'block';
      return;
    }

    loginHTML.style.display = 'block';
    logoutHTML.style.display = 'none';
  }

  updateMain (html)
  {
    let mainHTML = document.querySelector('main');
    mainHTML.innerHTML = html;
  }

  logout ()
  {
    this.user = null;
    window.location.href = '/';
  }

  async login ()
  {
    let users = await this.loadUsers();
    let userListHTML = document.querySelector('select[name="user"]');
    let user = users.find(user => user['id'] === parseInt(userListHTML.value));

    this.user = user;
    window.location.href = '/profil';
  }

  async translate ()
  {
    let translations = await this.loadTranslations();
    let language = await this.language();
    let toTranslateHTML = document.querySelectorAll('[data-text]');
    
    for (let x = 0; x < toTranslateHTML.length; x++) {
      let textHTML = toTranslateHTML[x];
      let text = textHTML.getAttribute('data-text');
      let translation = translations.find(translation => translation['reference'] === text && translation['lang'] === language['id']);
      
      if (translation) {
        textHTML.textContent = translation['value'];
      }
    }
  }

  async language ()
  {
    let languages = await this.loadLanguages();
    let lang = languages.find(language => language['id'] === this.lang);
    console.log(lang);

    return lang;
  }

  async page (target)
  {
    if (target === '') {
      return;
    }

    await this[`${target}Page`]()
  }

  async loginPage ()
  {
    let users = await this.loadUsers();
    let listHTML = document.querySelector('select[name="user"]');
    let loginHTML = document.querySelector('button[id="login"]');

    for (let user of users) {
      let optionHTML = document.createElement('option');
      optionHTML.value = user['id'];
      optionHTML.textContent = user['name'];
      listHTML.appendChild(optionHTML);
    }

    loginHTML.addEventListener('click', this.login.bind(this));
  }

  async profilPage ()
  {
    
  }
}