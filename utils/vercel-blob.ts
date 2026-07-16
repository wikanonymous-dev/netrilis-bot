import { del, put } from '@vercel/blob'

/**
 * Uploads a text/JSON string directly to Vercel Blob.
 * @param {string} pathname - The unique identifier/name for the file (e.g., 'artifact/job-123.json')
 * @param {object|string} data - Your JSON data or string
 * @returns {Promise<string>} The immutable public URL string of the saved blob
 */
export async function saveArtifact (pathname: string, data: string) {
    try {
        await put(pathname, data, {
            access: 'private'
        })
    } catch (error) {
        throw error
    }
}

export async function removeArtifact (pathname: string) {
    try {
        await del(pathname)
    } catch (error) {
        throw error
    }
}