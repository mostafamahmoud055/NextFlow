(function () {
  try {
    var key = 'nextflow-locale'
    var locale = 'en'
    var cookies = document.cookie ? document.cookie.split('; ') : []

    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=')
      if (parts[0] === key) {
        locale = decodeURIComponent(parts[1] || '')
        break
      }
    }

    if (locale !== 'en' && locale !== 'ar') {
      locale = 'en'
    }

    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
  } catch (e) {}
})()
