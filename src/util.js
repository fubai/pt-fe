function calcPage (query) {
  let totalPage = parseInt((query.total - 1) / query.limit, 10) + ((query.total - 1) % query.limit)
  let result = totalPage < query.page ? totalPage : query.page
  return result || 1
}

function getKey () {
  return new Date().getTime() + Math.ceil(Math.random() * 1000000)
}

function hasClass (el, className) {
  if (!el || !className) {
    return false
  }

  let classList = el.classList
  for (let i = 0; i < classList.length; i++) {
    let clazz = classList[i]
    if (clazz === className) {
      return true
    }
  }

  return false
}

function isArray (o) {
  return Object.prototype.toString.call(o) === '[object Array]'
}

function isObject (o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function isString (o) {
  return Object.prototype.toString.call(o) === '[object String]'
}

function isNumber (o) {
  return Object.prototype.toString.call(o) === '[object Number]'
}

function isDate (o) {
  return Object.prototype.toString.call(o) === '[object Date]'
}

function isRegExp (o) {
  return Object.prototype.toString.call(o) === '[object RegExp]'
}

function isFunction (fn) {
  return (typeof fn) === 'function'
}

function isJSON (str) {
  if (!isString(str)) {
    return false
  }
  try {
    let obj = JSON.parse(str)
    return isObject(obj) || isArray(obj)
  } catch (e) {
    return false
  }
}

function throwError (msg) {
  alert(msg)
  throw new Error(msg)
}

function formatDate (value) {
  let year = value.getFullYear()
  let month = value.getMonth() + 1
  if (month < 10) {
    month = '0' + month
  }
  let date = value.getDate()
  if (date < 10) {
    date = '0' + date
  }
  return `${year}-${month}-${date}`
}

function formatTimestamp (value) {
  let year = value.getFullYear()
  let month = value.getMonth() + 1
  if (month < 10) {
    month = '0' + month
  }
  let date = value.getDate()
  if (date < 10) {
    date = '0' + date
  }
  let hour = value.getHours()
  if (hour < 10) {
    hour = '0' + hour
  }
  let minute = value.getMinutes()
  if (minute < 10) {
    minute = '0' + minute
  }
  let second = value.getSeconds()
  if (second < 10) {
    second = '0' + second
  }

  return `${year}-${month}-${date} ${hour}:${minute}:${second}`
}

function formatTime (value) {
  let hour = value.getHours()
  if (hour < 10) {
    hour = '0' + hour
  }
  let minute = value.getMinutes()
  if (minute < 10) {
    minute = '0' + minute
  }
  let second = value.getSeconds()
  if (second < 10) {
    second = '0' + second
  }

  return `${hour}:${minute}:${second}`
}

export { calcPage, getKey, hasClass, isArray, isObject, isString, isNumber, isDate, isRegExp, isFunction, isJSON, throwError, formatDate, formatTimestamp, formatTime }
