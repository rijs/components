import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodent from 'rollup-plugin-nodent'
import buble from 'rollup-plugin-buble'

export default {
  input: 'index.js'
, output: {
    file: 'client.bundle.js'
  , format: 'iife'
  , name: 'components'
  }
, plugins: [
    nodeResolve({ browser: true })
  , commonjs()
  , nodent()
  , buble()
  ]
}