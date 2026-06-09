import type { DomainEventEnvelope } from './envelope'

export type ContentCaseStudyPublishedPayload = {
  caseStudyId: string
  title: string
  slug: string
}

export type ContentBlogPostPublishedPayload = {
  blogPostId: string
  title: string
  slug: string
}

export type ContentCaseStudyPublishedEvent = DomainEventEnvelope<
  'content.case_study.published',
  ContentCaseStudyPublishedPayload
>
export type ContentBlogPostPublishedEvent = DomainEventEnvelope<
  'content.blog_post.published',
  ContentBlogPostPublishedPayload
>

export type ContentDomainEvent = ContentCaseStudyPublishedEvent | ContentBlogPostPublishedEvent
