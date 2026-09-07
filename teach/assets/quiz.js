(function () {
  function render(root) {
    const questions = JSON.parse(root.getAttribute("data-questions"))
    questions.forEach((q, qi) => {
      const fieldset = document.createElement("fieldset")
      const legend = document.createElement("legend")
      legend.textContent = `${qi + 1}. ${q.q}`
      fieldset.appendChild(legend)
      const feedback = document.createElement("div")
      feedback.className = "feedback"
      q.options.forEach((text, oi) => {
        const label = document.createElement("label")
        const input = document.createElement("input")
        input.type = "radio"
        input.name = `${root.id}-q${qi}`
        input.addEventListener("change", () => {
          const ok = oi === q.answer
          feedback.textContent = ok ? `Верно. ${q.why}` : "Не то. Вспомни таймлайн и попробуй ещё раз."
          feedback.className = ok ? "feedback ok" : "feedback bad"
        })
        label.appendChild(input)
        label.appendChild(document.createTextNode(" " + text))
        fieldset.appendChild(label)
      })
      fieldset.appendChild(feedback)
      root.appendChild(fieldset)
    })
  }
  document.querySelectorAll(".quiz[data-questions]").forEach(render)
})()
