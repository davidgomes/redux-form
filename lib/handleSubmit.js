'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i]
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key]
        }
      }
    }
    return target
  }

var _immutable = require('immutable')

var _isPromise = require('is-promise')

var _isPromise2 = _interopRequireDefault(_isPromise)

var _SubmissionError = require('./SubmissionError')

var _SubmissionError2 = _interopRequireDefault(_SubmissionError)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i]
    }
    return arr2
  } else {
    return Array.from(arr)
  }
}

var mergeErrors = function mergeErrors(_ref) {
  var asyncErrors = _ref.asyncErrors,
    syncErrors = _ref.syncErrors
  return asyncErrors && _immutable.Iterable.isIterable(asyncErrors)
    ? asyncErrors.merge(syncErrors).toJS()
    : _extends({}, asyncErrors, syncErrors)
}

var handleSubmit = function handleSubmit(
  submit,
  props,
  valid,
  asyncValidate,
  fields
) {
  var dispatch = props.dispatch,
    onSubmitFail = props.onSubmitFail,
    onSubmitSuccess = props.onSubmitSuccess,
    startSubmit = props.startSubmit,
    stopSubmit = props.stopSubmit,
    setSubmitFailed = props.setSubmitFailed,
    setSubmitSucceeded = props.setSubmitSucceeded,
    syncErrors = props.syncErrors,
    asyncErrors = props.asyncErrors,
    touch = props.touch,
    values = props.values,
    persistentSubmitErrors = props.persistentSubmitErrors

  touch.apply(undefined, _toConsumableArray(fields)) // mark all fields as touched

  if (valid || persistentSubmitErrors) {
    var doSubmit = function doSubmit() {
      var result = void 0
      try {
        result = submit(values, dispatch, props)
      } catch (submitError) {
        var error =
          submitError instanceof _SubmissionError2.default
            ? submitError.errors
            : undefined
        stopSubmit(error)
        setSubmitFailed.apply(undefined, _toConsumableArray(fields))
        if (onSubmitFail) {
          onSubmitFail(error, dispatch, submitError, props)
        }
        if (error || onSubmitFail) {
          // if you've provided an onSubmitFail callback, don't re-throw the error
          return error
        } else {
          throw submitError
        }
      }
      if ((0, _isPromise2.default)(result)) {
        startSubmit()
        return result.then(
          function(submitResult) {
            stopSubmit()
            setSubmitSucceeded()
            if (onSubmitSuccess) {
              onSubmitSuccess(submitResult, dispatch, props)
            }
            return submitResult
          },
          function(submitError) {
            var error =
              submitError instanceof _SubmissionError2.default
                ? submitError.errors
                : undefined
            stopSubmit(error)
            setSubmitFailed.apply(undefined, _toConsumableArray(fields))
            if (onSubmitFail) {
              onSubmitFail(error, dispatch, submitError, props)
            }
            if (error || onSubmitFail) {
              // if you've provided an onSubmitFail callback, don't re-throw the error
              return error
            } else {
              throw submitError
            }
          }
        )
      } else {
        setSubmitSucceeded()
        if (onSubmitSuccess) {
          onSubmitSuccess(result, dispatch, props)
        }
      }
      return result
    }

    var asyncValidateResult = asyncValidate && asyncValidate()
    if (asyncValidateResult) {
      return asyncValidateResult
        .then(function(asyncErrors) {
          if (asyncErrors) {
            throw asyncErrors
          }
          return doSubmit()
        })
        .catch(function(asyncErrors) {
          setSubmitFailed.apply(undefined, _toConsumableArray(fields))
          if (onSubmitFail) {
            onSubmitFail(asyncErrors, dispatch, null, props)
          }
          return Promise.reject(asyncErrors)
        })
    } else {
      return doSubmit()
    }
  } else {
    setSubmitFailed.apply(undefined, _toConsumableArray(fields))
    var errors = mergeErrors({
      asyncErrors: asyncErrors,
      syncErrors: syncErrors
    })
    if (onSubmitFail) {
      onSubmitFail(errors, dispatch, null, props)
    }
    return errors
  }
}

exports.default = handleSubmit
