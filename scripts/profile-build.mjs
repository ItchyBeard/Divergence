// Local build diagnostics only; no runtime instrumentation or deployment.
import { build } from 'vite'
import { gzipSync } from 'node:zlib'
import { mkdir, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { Buffer } from 'node:buffer'

const label = process.argv[2] || 'current'
if (!/^[a-z-]+$/.test(label)) throw new Error('Expected a simple report label')
await mkdir('docs/performance/milestone-7', { recursive: true })
await build({
  plugins: [
    {
      name: 'local-bundle-profile',
      async writeBundle(_, bundle) {
        const chunks = Object.values(bundle).filter((entry) => entry.type === 'chunk')
        const entry = chunks.find((chunk) => chunk.isEntry)
        const initial = new Set()
        function visit(file) {
          if (initial.has(file)) return
          initial.add(file)
          bundle[file]?.imports?.forEach(visit)
        }
        visit(entry.fileName)
        const report = {
          entry: entry.fileName,
          initialBytes: [...initial].reduce(
            (sum, file) => sum + Buffer.byteLength(bundle[file].code),
            0
          ),
          initialGzipBytes: [...initial].reduce(
            (sum, file) => sum + gzipSync(bundle[file].code).length,
            0
          ),
          chunks: chunks.map((chunk) => ({
            file: chunk.fileName,
            initial: initial.has(chunk.fileName),
            bytes: Buffer.byteLength(chunk.code),
            minifiedCharacters: chunk.code.length,
            gzipBytes: gzipSync(chunk.code).length,
            imports: chunk.imports,
            dynamicImports: chunk.dynamicImports,
            // Rollup's renderedLength is before chunk-level minification.
            largestModules: Object.entries(chunk.modules)
              .map(([id, info]) => ({
                id: id.replaceAll('\\', '/').replace(process.cwd().replaceAll('\\', '/') + '/', ''),
                renderedBytes: info.renderedLength,
              }))
              .sort((a, b) => b.renderedBytes - a.renderedBytes)
              .slice(0, 15),
          })),
        }
        await writeFile(
          `docs/performance/milestone-7/${label}.json`,
          JSON.stringify(report, null, 2) + '\n'
        )
        console.log(
          'Initial JavaScript:',
          report.initialBytes,
          'bytes;',
          report.initialGzipBytes,
          'gzip bytes'
        )
      },
    },
  ],
})
