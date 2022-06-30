import sanityClient from '@sanity/client'

export const client = sanityClient({
  projectId: 'fqz284x5',
  dataset: 'production',
  apiVersion: 'v1',
  token:
    'skPe0NeljwnKK8FvPvMbHuHBavV57JzxQrDG172Hqp6oiWoAoamAlOm1S415ObYls8xAXhFch3kO5ealkHSg6g2cIgBeZkcywWUxEioCmed0ps59DVP702YHCTKSK8T3fU0BiTuH4nGZfEgumN3a2o7AQhMcbUIU9dDVQuFoGyKNPdBDIudk',
  useCdn: false,
})
