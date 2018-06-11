import { startCluster, ClusterOptions } from 'egg'
import * as nwwc from 'windows-window-controller'


export interface ClusterOptionsInt extends ClusterOptions {
  framework: string
  baseDir: string
  plugins: object | null
  workers: number
  port: number
  https: boolean
  key: string
  cert: string
  clusterPort: number
  title?: string
}

export interface ClusterMsg {
  action: 'egg-ready' | 'egg-pids'
  to: 'agent' | 'app'
  data?: ClusterOptionsInt | number[] | any
  from: 'agent' | 'app' | 'master'
}

// change window title
process.on('message', (msg: ClusterMsg) => {
  if (msg && msg.action) {
    const { action, data, from, to } = msg

    // console.info('::message:', process.pid, process.ppid, msg)
    if (action === 'egg-ready') {
      if ((to === 'app' || to === 'agent') && from === 'master') {
        const titleNew = data ? parseKeyStr(data.title ? data.title : data.baseDir) : ''

        titleNew && titleNew !== process.title && nwwc.set_title(titleNew, {
          matchType: 'pid',
          matchValue: process.pid,
        })
        .then(() => {
          nwwc.hide({
            matchType: 'pid',
            matchValue: process.pid,
          })
        })
        .catch(err => { })
      }
    }
  }
})

function parseKeyStr(str: string): string {
  const regexDim = /\\+/g
  const ret = str && typeof str === 'string' ? str : ''
  return ret.replace(regexDim, '/')
}

export default startCluster
// export default (options: ClusterOptions, cb: (...args: any[]) => any) => {
//   return startCluster(options, cb)
// }
