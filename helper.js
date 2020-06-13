var { getComputed, appendState, setState, getState } = require('concent');

var pluginName = 'cuStatus';

var module_batchCount_ = {};

function makeCuState(done, retKey, err) {
  var toReturn = { done: true, err: null, retKey: '' };
  if (done !== undefined) toReturn.done = done;
  if (err !== undefined) toReturn.err = err;
  if (retKey !== undefined) toReturn.retKey = retKey;
  return toReturn;
}

function makeCuStateKey(module, retKey) {
  return module + '/' + retKey;
}

function incBatchCount(module) {
  try {
    module_batchCount_[module]++;
  } catch (err) {
    module_batchCount_[module] = 1;
  }
}

function decBatchCount(module) {
  try {
    module_batchCount_[module]--;
  } catch (err) {
    module_batchCount_[module] = 0;
  }
}

function changeDone(data, done) {
  var payload = data.payload;
  var retKey = payload.retKey;
  var module = payload.module;
  var err = payload.err;
  var stateKey = makeCuStateKey(module, retKey);

  const cuStatus = getState(pluginName);

  if (cuStatus[module].done !== done) {
    var toSet = {};
    toSet[stateKey] = makeCuState(done, retKey, err);
    setState(pluginName, toSet);
  }
}

exports.getPluginName = function () {
  return pluginName;
}

exports.setPluginName = function (_pluginName) {
  pluginName = _pluginName;
}

exports.makeComputedStatusState = function (module) {
  var targetComputed = {};
  if (module) {
    targetComputed[module] = getComputed(module);
  } else {
    targetComputed = getComputed();;
  }
  var state = {};

  Object.keys(targetComputed).forEach(function (module) {
    state[module] = makeCuState();
    module_batchCount_[module] = 0;

    const subComputed = targetComputed[module];
    Object.getOwnPropertyNames(subComputed).forEach(function (retKey) {
      state[makeCuStateKey(module, retKey)] = makeCuState(true, retKey);
    });
  });

  return state;
}

/**
 * 通过configure接口配置了新模块时，触发此函数
 */
exports.onModuleConfigured = function (data) {
  var newModule = data.payload;
  var toAppend = makeComputedStatusState(newModule);

  appendState(getPluginName(), toAppend);
}

exports.onCuBatchStart = function (data) {
  var module = data.payload.module;
  incBatchCount(module);
  const cuStatus = getState(pluginName);
  
  if (cuStatus[module].done === true) {
    var toSet = {};
    toSet[module] = makeCuState(false);
    setState(pluginName, toSet);
  }
}

exports.onCuBatchEnd = function (data) {
  var payload = data.payload;
  var module = payload.module;
  var retKey = payload.retKey || '';
  var err = payload.err || null;
  decBatchCount(module);
  const cuStatus = getState(pluginName);
  const modCuStatus = cuStatus[module];

  const done = module_batchCount_[module] === 0;

  if (modCuStatus.done !== done || modCuStatus.err !== err) {
    var toSet = {};
    toSet[module] = makeCuState(done, retKey, err);
    setState(pluginName, toSet);
  }
}

exports.onCuFnStart = function (data) {
  changeDone(data, false);
}

exports.onCuFnEnd = function (data) {
  changeDone(data, true);
}

exports.onCuFnError = function (data) {
  changeDone(data, true);
}
