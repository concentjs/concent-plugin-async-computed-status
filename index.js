var { cst, configure } = require('concent');
var helper = require('./helper');

var { makeComputedStatusState, getPluginName, setPluginName } = helper;

var toExport = module.exports = {};

/** concent启动时会调用一次插件的install接口 */
toExport.install = function (on) {
  const pluginName = getPluginName();
  var state = makeComputedStatusState();
  // 将cuStatus配置成concent的模块
  configure(pluginName, { state });

  on(cst.SIG_ASYNC_COMPUTED_START, helper.onCuFnStart);

  on(cst.SIG_ASYNC_COMPUTED_END, helper.onCuFnEnd);

  on(cst.SIG_ASYNC_COMPUTED_ERR, helper.onCuFnError);

  on(cst.SIG_ASYNC_COMPUTED_BATCH_START, helper.onCuBatchStart);

  on(cst.SIG_ASYNC_COMPUTED_BATCH_END, helper.onCuBatchEnd);

  on(cst.SIG_MODULE_CONFIGURED, helper.onModuleConfigured);

  return { name: pluginName }
}

toExport.setConf = function (conf) {
  if (!conf) return;
  
  if (conf.pluginName) {
    setPluginName(conf.pluginName);
  }
}

toExport.default = toExport;
