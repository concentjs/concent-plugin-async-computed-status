
export declare function setConf(config: { pluginName: string }): void;

declare type DefaultExport = {
  setConf: typeof setConf,
  install: (on: any) => any,
}

declare let defaultExport: DefaultExport;
export default defaultExport;