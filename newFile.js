const input = document.getElementById('search')
const autocompleteList = document.getElementById('autocomplete-list')
const repoList = document.getElementById('repo-list')

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
// отдельная функция для списков
function createAutocompleteItem(repo, onClick) {
  const li = document.createElement('li')
  li.textContent = repo.full_name
  li.addEventListener('mouseover', () => (li.style.background = '#b2ebf2'))
  li.addEventListener('mouseout', () => (li.style.background = ''))
  li.addEventListener('click', () => onClick(repo))
  return li
}
// отдельная функция удаления
function createRemoveButton(onClick) {
  const btn = document.createElement('button')
  btn.className = 'remove-btn'
  btn.title = 'Remove'
  btn.innerHTML = `<svg viewBox="0 0 42 42"><line x1="6" y1="6" x2="36" y2="36"/><line x1="36" y1="6" x2="6" y2="36"/></svg>`
  btn.addEventListener('click', onClick)
  return btn
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
        const li = createAutocompleteItem(repo, addRepo)
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
    const removeBtn = createRemoveButton(() => {
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
