
export class UploadBookService 
{
    static mapUploadData(data : any[]) : any[] 
    {
        try 
        {
            const ams =  data.reduce((res , curr) => {
                res.push({
                    code : curr.BookCode, 
                    title: curr.title, 
                    authorIds: curr.Author.split(',').map((x : string) => Number(x)), 
                    publisherId: curr.Publisher.split(',').map((x : string) => Number(x)), 
                    coverImage : curr.CoverImage 
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