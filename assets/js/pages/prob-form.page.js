parasails.registerPage('prob-form-fake', {
  data: {
    matches: []
  },
  async mounted() {
    const html = await $.get('https://www.gazzetta.it/Calcio/prob_form/')
    const header = $('.prob-form__header')
    const container = $('#prob-form')

    // parse html string in different document to avoid favicon to be replaced
    // with gds one
    $($.parseHTML(html)).find('.matchFieldContainer').each((i, el) => {
      const match = $(el)

      const teamHome = match.find('.match .team').eq(0).text().trim()
      const teamAway = match.find('.match .team').eq(1).text().trim()

      // Set id for anchor nav
      match.attr('id', i)

      $(`<div class="prob-form__match" data-match="${i}">
        <div>${teamHome}</div><div>${teamAway}</div></div>`).appendTo(header)

      match.find('.match').replaceWith(`<div class="columns is-mobile">
        <div class="column is-size-2-tablet is-size-3-mobile has-text-right">${teamHome}</div>
        <div class="is-size-2-tablet is-size-3-mobile" style="padding:.75rem">-</div>
        <div class="column is-size-2-tablet is-size-3-mobile">${teamAway}</div>
      </div>`)

      // remove link to field view
      match.find('.fieldLink').remove()

      match.addClass('box')
      match.appendTo(container)
    })

    $('.prob-form__match').click(function () {
      $(document.documentElement).animate({
        scrollTop: $(`#${this.dataset.match}`).offset().top - header.outerHeight() - 50
      }, 500)
    })
  }
})
