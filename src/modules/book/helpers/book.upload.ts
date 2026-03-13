
export class UploadBookService 
{
    static mapUploadData(data : any[]) : any[] 
    {
        try 
        {
            const ams =  data.reduce((res , curr) => {
                res.push({
                    code : curr.Code, 
                    title: curr.Title, 
                    authorIds: String(curr.Author).split(',').map((x : string) => Number(x)), 
                    publisherIds: String(curr.Publisher).split(',').map((x : string) => Number(x)), 
                    coverImage : curr.CoverImage, 
                    stock : curr.Stock, 
                    cost : curr.Cost 
                }) 
                return res 
            } , [])
            return ams 
        } 
        catch (err) 
        {
            console.log("Mapping Upload Book Error: " , err) 
            throw err 
        }
    }
    
}