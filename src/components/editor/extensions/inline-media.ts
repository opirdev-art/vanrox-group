import { Node, mergeAttributes } from '@tiptap/core'

export type InlineMediaLayout = 'contained' | 'full'
export type InlineMediaKind = 'image' | 'video_embed'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inlineMedia: {
      insertInlineMedia: (attrs: {
        src: string
        kind: InlineMediaKind
        layout?: InlineMediaLayout
        caption?: string
        alt?: string
      }) => ReturnType
    }
  }
}

export const InlineMedia = Node.create({
  name: 'inlineMedia',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: '' },
      kind: { default: 'image' },
      layout: { default: 'contained' },
      caption: { default: '' },
      alt: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-block="media"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { kind, layout, src, alt, caption } = HTMLAttributes as {
      kind: InlineMediaKind
      layout: InlineMediaLayout
      src: string
      alt?: string
      caption?: string
    }

    const figAttrs = { 'data-block': 'media', 'data-layout': layout || 'contained' }

    if (kind === 'video_embed') {
      const children: unknown[] = [
        ['div', { class: 'cs-embed' }, ['iframe', { src, frameborder: '0', allowfullscreen: 'true', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', title: caption || '' }]],
      ]
      if (caption) children.push(['figcaption', {}, caption])
      return ['figure', mergeAttributes(figAttrs), ...children]
    }

    const children: unknown[] = [['img', { src, alt: alt || '', loading: 'lazy' }]]
    if (caption) children.push(['figcaption', {}, caption])
    return ['figure', mergeAttributes(figAttrs), ...children]
  },

  addCommands() {
    return {
      insertInlineMedia:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    }
  },
})
