function _apiForm() {
  return {
    currentForm: 'contributors',
    showAdvancedOptions: false,
    showResults: false,
    loading: false,
    imageUrl: '',
    format: 'Markdown',
    user: '',
    repo: '',
    outputMode: false, // false = static, true = dynamic
    showError: false,
    options: [
      { name: 'title', value: '', label: 'Title', placeholder: 'Enter title' },
      { name: 'avatarSize', value: '', label: 'Avatar Size', placeholder: '80' },
      { name: 'perRow', value: '', label: 'Per Row', placeholder: 'Number per row' },
      { name: 'shape', value: '', label: 'Shape', placeholder: 'e.g., circle, square' },
      { name: 'fontSize', value: '', label: 'Font Size', placeholder: '16' },
      { name: 'textColor', value: '', label: 'Text Color', placeholder: 'e.g., black, #333' },
      {
        name: 'backgroundColor',
        value: '',
        label: 'Background Color',
        placeholder: 'e.g., white, #fff',
      },
      { name: 'fontFamily', value: '', label: 'Font Family', placeholder: 'e.g., Arial' },
      { name: 'margin', value: '', label: 'Margin', placeholder: '35' },
      { name: 'textOffset', value: '', label: 'Text Offset', placeholder: 'Offset for text' },
      { name: 'limit', value: '', label: 'Limit', placeholder: 'Limit number displayed' },
    ],
    exampleIndex: -1,
    examples: [
      'http://readme-contribs.as93.net/forkers/Lissy93/AdGuardian-Term?title=AdGuardian%20Forkers&textColo' +
        'r=bfbfbf&isResponsive=true&dynamic=true&outerBorderWidth=2&outerBorderRadius=5&footerText=none',
      'https://readme-contribs.as93.net/sponsors/lissy93?shape=squircle&dynamic=true&margin=16&textOffset=' +
        '8&perRow=6&title=@Lissy93%27s%20Sponsors&textColor=white&isResponsive=true&backgroundC' +
        'olor=black&fontFamily=Courier%20New&fontSize=8&footerText=none',
      'https://readme-contribs.as93.net/stargazers/lissy93/web-check?shape=square&margin=16&perRow=15&titl' +
        "e=Web-Check's Stargazers&textColor=9fef00&isResponsive=true&backgroundColor=101215&fo" +
        'ntFamily=cursive&fontSize=14&limit=90&footerText=none',
      'https://readme-contribs.as93.net/contributors/lissy93/dashy?shape=squircle&perRow=10&title=Lissy93%' +
        '2FDashy%27s%20Top%20Contributors&textColor=black&isResponsive=true&backgroundColor=00d' +
        '1b2&margin=6&hideLabel=true&textOffset=2&footerText=none',
      'https://readme-contribs.as93.net/stargazers/steverichey/hot-dog-stand?backgroundColor=red&textColor' +
        '=yellow&outerBorderWidth=5&outerBorderRadius=8fontFamily=Comic Sans&fontSize=12&avatarSize=64&per' +
        'Row=4&title=SteveRichey/Hot-Dog-Stand&isResponsive=true&dynamic=true&footerText=none&shape=circle',
      'https://readme-contribs.as93.net/contributors/rust-lang/rust?hideLabel=true&margin=2&textOffset=0&p' +
        'erRow=10&title=Rust%20Lang%20Top%20Contributors&isResponsive=true&dynamic=true&footerText=none',
    ],
    showExample() {
      const frameLoader = document.getElementById('load-frame')
      const iframe = document.querySelector('.example-grid iframe')
      frameLoader.style.display = 'block'
      iframe.style.display = 'none'
      this.exampleIndex = (this.exampleIndex + 1) % this.examples.length
      iframe.src = this.examples[this.exampleIndex]
      iframe.className = `example-${this.exampleIndex + 1}`
      iframe.onload = () => {
        frameLoader.style.display = 'none'
        iframe.style.display = 'block'
      }
    },
    toggleForm(formType) {
      this.currentForm = formType
      this.showResults = false
      this.loading = false
    },
    submitForm() {
      if (!this.user || (this.currentForm !== 'sponsors' && !this.repo)) {
        this.showError = true
        return
      }
      this.loading = true
      this.imageUrl = this.generatedUrl
      this.showResults = true
      this.showError = false
    },
    copyToClipboard(text) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert('Copied to clipboard!')
        })
        .catch((_err) => {
          alert('Failed to copy!')
        })
    },
    generateSnippet(format) {
      switch (format) {
        case 'Markdown':
          return `![${this.currentForm} badge](${this.generatedUrl})`
        case 'HTML Image':
          return `<img src="${this.generatedUrl}" alt="Badge">`
        case 'HTML Embed':
          return `<iframe src="${this.generatedUrl}" title="${this.currentForm}"></iframe>`
        case 'BB Code':
          return `[img]${this.generatedUrl}[/img]`
        case 'Direct Link':
          return this.generatedUrl
        default:
          return ''
      }
    },
    get generatedUrl() {
      const host = window.location.host || 'readme-contribs.as93.net'
      let baseUrl = `https://${host}/${this.currentForm}/${this.user || '[username]'}`
      if (this.currentForm !== 'sponsors') {
        baseUrl += `/${this.repo || '[repo]'}`
      }
      const formatValue = (val) => (val || '').replaceAll('#', '')
      const queryParams = this.options
        .filter((option) => option.value)
        .map((option) => `${option.name}=${encodeURIComponent(formatValue(option.value))}`)
        .join('&')
      return queryParams ? `${baseUrl}?${queryParams}` : baseUrl
    },
  }
}
