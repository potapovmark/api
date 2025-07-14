const button = document.getElementById('btn')
const label = document.getElementById('message')

button.addEventListener('click', async () => {
  console.log('Fetching users... Please wait.')
  button.disabled = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const response = await fetch('https://jsonplaceholder.typicode.com/users')
    if (!response.ok) {
      throw new Error('Network error')
    }

    const users = await response.json()

    message.textContent = 'Users: ' + users.map((u) => u.name).join(', ')
  } catch (error) {
    message.style.color = 'red'
    message.textContent = 'Failed to load users.'
  } finally {
    setTimeout(() => {
      button.disabled = false
    }, 2000)
  }
})
