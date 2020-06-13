
### concent-plugin-loading
管理concent模块异步函数执行状态的concent插件

### [在线示例](https://codesandbox.io/s/async-computed-35byz?file=/src/App.js:428-464)

```js
import cuStatusPlugin from "concent-plugin-async-computed-status";
import { run, useConcent } from "concent";

run(
  {
    counter: {
      state: { num: 1, numBig: 100 },
      computed: {
        numx10({ num }) {
          return num * 10;
        },
        async numx10_2({ num }, o, f) {
          // 必需调用setInitialVal给numx10_2一个初始值，
          // 该函数仅在初次computed触发时执行一次
          f.setInitialVal(num * 55);
          await delay();
          return num * 100;
        },
        async numx10_3({ num }, o, f) {
          f.setInitialVal(num * 1);
          await delay();
          const ret = num * f.cuVal.numx10_2;
          if (ret % 900 === 0) throw new Error("-->mock error");
          return ret;
        }
      }
    }
  },
  {
    errorHandler: err => {
      console.error('errorHandler ', err);
      // alert(err.message);
    },
    plugins: [cuStatusPlugin]
  }
);


function Test() {
  const { moduleComputed, connectedState, setState, state, ccUniqueKey } = useConcent({
    module: "counter",
    connect: ["cuStatus"]
  });
  const changeNum = () => setState({ num: state.num + 1 });
  const counterCuStatus = connectedState.cuStatus.counter;
  console.log(ccUniqueKey);

  return (
    <div>
      {counterCuStatus.done ? moduleComputed.numx10 : 'computing'}
      {counterCuStatus.err ? counterCuStatus.err.message : ''}
      <button onClick={changeNum}>changeNum</button>
    </div>
  );
}
```