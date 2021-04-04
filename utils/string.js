let toSlug = string => string.toLowerCase().replace(/[^0-9a-z\s\-]/g, '').replace(/\-+/g, ' ').trim().replace(/\s+/g, '-')

module.exports = { toSlug }