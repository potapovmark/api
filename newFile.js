// === СТИЛИ ДЛЯ ВСЕГО ПРИЛОЖЕНИЯ (ТОЛЬКО ПОЛЕ ВВОДА И СПИСОК) ===
const style = document.createElement('style')
style.textContent = `
  body {
    background: #bdbdbd;
    min-height: 100vh;
    margin: 0;
    font-family: Arial, sans-serif;
  }
  .center-container {
    max-width: 500px;
    margin: 40px auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .autocomplete-input {
    width: 100%;
    max-width: 500px;
    font-size: 20px;
    padding: 8px;
    margin: 0 0 16px 0;
    border: 2px solid #111;
    border-radius: 0;
    box-sizing: border-box;
    outline: none;
    display: block;
  }
  .autocomplete-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 496px;
    position: absolute;
    background: #fff;
    border: 2px solid #111;
    z-index: 1000;
    font-size: 20px;
    display: none;
    left: 50%;
    transform: translateX(-50%);
    top: 43px;
    border-top: none;
  }
  .autocomplete-list li {
    cursor: pointer;
    padding: 10px 16px;
    border-bottom: 2px solid #111;
    background: #fff;
    transition: background 0.2s;
    background: #e3e3e3;
  }
  .autocomplete-list li:last-child {
    border-bottom: none;
  }
  .autocomplete-list li:hover {
    background: #b2ebf2;
  }
  .repo-list {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .repo-card {
    background: #e27beb;
    border: 2px solid #111;
    margin-bottom: 0;
    padding: 16px 16px 16px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    min-height: 60px;
    font-size: 22px;
    box-sizing: border-box;
    border-radius: 0;
  }
  .repo-card + .repo-card {
    border-top: none;
  }
  .repo-info {
    display: flex;
    flex-direction: column;
    gap: 0;
    font-size: 22px;
    color: #111;
    font-weight: normal;
    line-height: 1.2;
  }
  .repo-info span {
    display: block;
    color: #111;
    font-size: 22px;
    margin-bottom: 0;
    font-weight: normal;
  }
  .repo-link {
    color: #111;
    text-decoration: none;
    font-weight: normal;
    font-size: 22px;
    word-break: break-all;
  }
  .remove-btn {
    background: none;
    border: none;
    color: #ff1818;
    font-size: 42px;
    font-weight: normal;
    cursor: pointer;
    line-height: 1;
    margin-left: 16px;
    margin-right: 0;
    padding: 0;
    transition: color 0.2s;
    position: static;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
  }
  .remove-btn svg {
    display: block;
    width: 42px;
    height: 42px;
    stroke: #ff1818;
    stroke-width: 4px;
    stroke-linecap: butt;
    stroke-linejoin: miter;
    background: none;
  }
  .remove-btn:hover {
    color: #b71c1c;
  }
`
document.head.appendChild(style)

// === СОЗДАНИЕ ОСНОВНОЙ РАЗМЕТКИ ===
const container = document.createElement('div')
container.className = 'center-container'

const input = document.createElement('input')
input.id = 'search'
input.type = 'text'
input.placeholder = 'Search repositories...'
input.autocomplete = 'off'
input.className = 'autocomplete-input'

const autocompleteList = document.createElement('ul')
autocompleteList.id = 'autocomplete-list'
autocompleteList.className = 'autocomplete-list'
autocompleteList.style.position = 'absolute'

const repoList = document.createElement('ul')
repoList.id = 'repo-list'
repoList.className = 'repo-list'

container.appendChild(input)
container.appendChild(autocompleteList)
container.appendChild(repoList)
document.body.appendChild(container)

document.body.style.position = 'relative'

let repos = []

function debounce(fn, delay) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(this, args), delay)
  }
}

async function searchRepos(query) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(
      query
    )}&per_page=5`
  )
  if (!response.ok) throw new Error('GitHub API error')
  const data = await response.json()
  return data.items
}

input.addEventListener(
  'input',
  debounce(async function () {
    const query = input.value.trim()
    autocompleteList.innerHTML = ''
    autocompleteList.style.display = 'none'
    if (!query) return
    try {
      const results = await searchRepos(query)
      if (results.length) autocompleteList.style.display = 'block'
      results.forEach((repo) => {
        const li = document.createElement('li')
        li.textContent = repo.full_name
        li.addEventListener(
          'mouseover',
          () => (li.style.background = '#b2ebf2')
        )
        li.addEventListener('mouseout', () => (li.style.background = ''))
        li.addEventListener('click', () => addRepo(repo))
        autocompleteList.appendChild(li)
      })
    } catch (e) {}
  }, 500)
)

function addRepo(repo) {
  if (repos.some((r) => r.id === repo.id)) return
  repos.push(repo)
  renderRepoList()
  input.value = ''
  autocompleteList.innerHTML = ''
  autocompleteList.style.display = 'none'
}

function renderRepoList() {
  repoList.innerHTML = ''
  repos.forEach((repo) => {
    const li = document.createElement('li')
    li.className = 'repo-card'
    const info = document.createElement('div')
    info.className = 'repo-info'
    info.innerHTML = `
      <span>Name: ${repo.name}</span>
      <span>Owner: ${repo.owner.login}</span>
      <span>Stars: ${repo.stargazers_count}</span>
    `
    const removeBtn = document.createElement('button')
    removeBtn.className = 'remove-btn'
    removeBtn.title = 'Remove'
    removeBtn.innerHTML = `<svg viewBox="0 0 42 42"><line x1="6" y1="6" x2="36" y2="36"/><line x1="36" y1="6" x2="6" y2="36"/></svg>`
    removeBtn.addEventListener('click', () => {
      repos = repos.filter((r) => r.id !== repo.id)
      renderRepoList()
    })
    li.appendChild(info)
    li.appendChild(removeBtn)
    repoList.appendChild(li)
  })
}

window.addEventListener('click', (e) => {
  if (e.target !== input) {
    autocompleteList.innerHTML = ''
    autocompleteList.style.display = 'none'
  }
})
