export let api

let href = location.href
if (href.indexOf('localhost:9991') !== -1) {
  api = 'http://localhost:8081'
} else {
  let segments = location.href.split('/')
  api = segments[0] + '//' + segments[2]
}
