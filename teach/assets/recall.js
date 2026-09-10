(function () {
  const STORAGE_PREFIX = "recall:"

  function loadState(id) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PREFIX + id) || "{}")
    } catch {
      return {}
    }
  }

  function saveState(id, state) {
    try {
      localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(state))
    } catch {}
  }

  function render(root) {
    const cards = JSON.parse(root.getAttribute("data-cards"))
    const state = loadState(root.id)
    const summary = document.createElement("p")
    summary.className = "summary"

    function updateSummary() {
      const known = Object.values(state).filter((v) => v === "known").length
      const unknown = Object.values(state).filter((v) => v === "unknown").length
      const left = cards.length - known - unknown
      summary.textContent = `Вспомнил: ${known}. Не вспомнил: ${unknown}. Осталось: ${left}. Карточки с пометкой «не вспомнил» повтори через два дня.`
    }

    const reset = document.createElement("button")
    reset.textContent = "Сбросить отметки"
    reset.addEventListener("click", () => {
      Object.keys(state).forEach((k) => delete state[k])
      saveState(root.id, state)
      root.querySelectorAll(".card").forEach((card) => {
        card.classList.remove("open", "known", "unknown")
      })
      updateSummary()
    })

    root.appendChild(summary)
    root.appendChild(reset)

    cards.forEach((c, i) => {
      const card = document.createElement("div")
      card.className = "card"
      if (state[i]) card.classList.add(state[i])

      if (c.phase) {
        const phase = document.createElement("div")
        phase.className = "phase"
        phase.textContent = c.phase
        card.appendChild(phase)
      }

      const q = document.createElement("p")
      q.className = "q"
      q.innerHTML = `${i + 1}. ${c.q}`
      card.appendChild(q)

      const show = document.createElement("button")
      show.textContent = "Показать ответ"
      show.addEventListener("click", () => {
        card.classList.add("open")
        show.disabled = true
      })
      card.appendChild(show)

      const a = document.createElement("div")
      a.className = "a"
      a.innerHTML = c.a
      card.appendChild(a)

      const grade = document.createElement("div")
      grade.className = "grade"
      const known = document.createElement("button")
      known.textContent = "Вспомнил сам"
      const unknown = document.createElement("button")
      unknown.textContent = "Не вспомнил"
      function mark(value) {
        state[i] = value
        saveState(root.id, state)
        card.classList.remove("known", "unknown")
        card.classList.add(value)
        updateSummary()
      }
      known.addEventListener("click", () => mark("known"))
      unknown.addEventListener("click", () => mark("unknown"))
      grade.appendChild(known)
      grade.appendChild(unknown)
      card.appendChild(grade)

      root.appendChild(card)
    })

    updateSummary()
  }

  document.querySelectorAll(".recall[data-cards]").forEach(render)
})()
