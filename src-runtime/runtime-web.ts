// 使用 plugins/vite-plugin-init-autox-bridge.ts 转为 js, 添加到 html 中
class AutoxBridge {
  private _callback_store: { [key: number]: Function }

  private _callback_counter: number

  constructor() {
    this._callback_store = {}
    this._callback_counter = 0
  }

  private _setCallback(callback: Function) {
    this._callback_counter += 1
    this._callback_store[this._callback_counter] = callback
    return this._callback_counter
  }

  private _getCallback(id: number) {
    const callback = this._callback_store[id]
    if (callback) {
      delete this._callback_store[id]
    }
    return callback
  }

  /**
   * 调用 aj 的函数
   * @param cmd 函数名
   * @param args 参数 / 参数数组 / "[code]"
   * @param callback 回调函数
   */
  public invoke(cmd: string, args: any | any[] | '[code]', callback?: Function) {
    let callId = -1
    try {
      if (callback) {
        callId = this._setCallback(callback)
      }
      const data = JSON.stringify({
        cmd,
        args,
        callId,
      })
      // 通过特殊的前缀，把数据传给 aj
      console.log(`jsbridge://${encodeURIComponent(data)}`)
    } catch (e) {
      console.trace(e)
    }
  }

  /**
   * aj 调用这个函数，来传递返回值
   */
  public callback(data: { callId: number; args: any }) {
    const callId = data.callId
    const args = data.args

    const callbackFn = this._getCallback(callId) // 获取函数指针
    if (callbackFn) {
      callbackFn(args) // 调用
    }
  }
}
// @ts-expect-error 在 web 中调用
const MyAutoxBridge = new AutoxBridge()
