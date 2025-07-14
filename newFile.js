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

const input = document.createElement('input')
input.id = 'search'
input.type = 'text'
input.placeholder = 'Search repositories...'
input.autocomplete = 'off'
input.style.display = 'block'
input.style.margin = '30px auto 0 auto'
input.style.width = '90%'
input.style.maxWidth = '400px'
input.style.fontSize = '18px'
input.style.padding = '8px'

const autocompleteList = document.createElement('ul')
autocompleteList.id = 'autocomplete-list'
autocompleteList.style.listStyle = 'none'
autocompleteList.style.padding = '0'
autocompleteList.style.margin = '0 auto'
autocompleteList.style.width = '90%'
autocompleteList.style.maxWidth = '400px'
autocompleteList.style.position = 'absolute'
autocompleteList.style.background = '#fff'
autocompleteList.style.border = '1px solid #ccc'
autocompleteList.style.zIndex = '1000'
autocompleteList.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
autocompleteList.style.fontSize = '16px'
autocompleteList.style.display = 'none'

const repoList = document.createElement('ul')
repoList.id = 'repo-list'
repoList.style.listStyle = 'none'
repoList.style.padding = '0'
repoList.style.margin = '30px auto 0 auto'
repoList.style.width = '90%'
repoList.style.maxWidth = '400px'

window.addEventListener('DOMContentLoaded', () => {
  document.body.style.position = 'relative'
  document.body.appendChild(input)
  document.body.appendChild(autocompleteList)
  document.body.appendChild(repoList)
})

let repos = []

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
        li.style.cursor = 'pointer'
        li.style.padding = '8px 12px'
        li.style.borderBottom = '1px solid #eee'
        li.addEventListener(
          'mouseover',
          () => (li.style.background = '#f5f5f5')
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
    li.style.display = 'flex'
    li.style.alignItems = 'center'
    li.style.justifyContent = 'space-between'
    li.style.padding = '10px 0'
    li.style.borderBottom = '1px solid #eee'
    const info = document.createElement('span')
    info.innerHTML = `<strong>${repo.name}</strong> (${repo.owner.login}) ★${repo.stargazers_count}`
    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'Remove'
    removeBtn.style.marginLeft = '10px'
    removeBtn.style.background = '#e74c3c'
    removeBtn.style.color = '#fff'
    removeBtn.style.border = 'none'
    removeBtn.style.padding = '4px 10px'
    removeBtn.style.borderRadius = '4px'
    removeBtn.style.cursor = 'pointer'
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
