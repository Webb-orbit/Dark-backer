import { v2 } from "cloudinary";
import fs from "fs"

class cloudinaryuploader {
    constructor() {
        v2.config({
            cloud_name: process.env.CLOUDNAME,
            api_key: process.env.CLOUD_API_KEY,
            api_secret: process.env.CLOUD_SECRET
        })
    }

    async uploadfile(filepath) {
        try {
            if (!filepath) return null
            let value = await v2.uploader.upload(filepath, {
                resource_type: "auto"
            })
            console.log(value);
            return value
        } catch (error) {
            console.log(error);
            return null
        } finally {
            fs.unlinkSync(filepath)
        }
    }

    async deletefile(publicurl) {
        if (!publicurl) return null
        const publicid = extractfileidFromUrl(publicurl)
        try {
            await v2.uploader.destroy(publicid, (err, res) => {
                if (err) {
                    console.error('Error deleting image:', err);
                    return null
                } else {
                    console.log('Image deleted successfully:', res);
                    return res
                }
            })
        } catch (error) {
            console.log(error);
            return null
        }
    }

    extractfileidFromUrl(url) {
        const regex = /\/([^/]+)\.(jpg|jpeg|png|gif|bmp|svg|webp|mp4|mkv|mov|avi|wmv|flv|webm)$/i;
        const match = url.match(regex);
        return match ? match[1] : null;
    }
}

export const { uploadfile, extractfileidFromUrl, deletefile } = new cloudinaryuploader()