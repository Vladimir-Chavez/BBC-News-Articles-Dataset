import * as fs from 'fs';
import * as path from 'path';

export namespace DataCurator{


    export interface ArticleMap extends Map<string,{title:string, text:string}>{}

    export class Program{
        private static _dataDir:string|undefined;

        static main(){
            // set raw data path
            try {
                Program.DataDir = path.join(__dirname, "../../bbc_raw");
            } catch(e){
                console.log(e.message);
            }
            if(Program.DataDir){
                let categories:string[] = [];
                let dir = Program.DataDir;
                fs.readdir(Program.DataDir, (err, files) => {
                    if (err){
                        console.log(err.message);
                    } else {
                        // create data dictionary
                        let catDataMap = new Map<string,ArticleMap>();
                        let articleCount = 0;
                        for (let i = 0; i < files.length; i++){
                            let cat = files[i];
                            try {
                                let articles = fs.readdirSync(path.join(
                                    dir, cat));
                                articleCount += articles.length;
                                console.log(`Processing ${articles.length} articles...`);
                                let articleMap:ArticleMap = new Map();
                                // get title and article data
                                for (let j = 0; j < articles.length; j++){
                                    let raw = fs.readFileSync(path.join(
                                        dir,cat,articles[j]));
                                    let data = raw.toString().split("\n");
                                    let title = data[0];
                                    data.shift();
                                    let text = data.join(" ");
                                    articleMap.set(articles[j],{
                                        title:title,
                                        text:text
                                    });
                                    console.count(`category: ${cat} - processing files...`);
                                    console.log(`${Math.round((j*100 / articles.length))}`);
                                }
                                catDataMap.set(cat,articleMap);
                            } catch(e){}
                        }
                        let header = true;
                        const csvPath = path.join(dir, "js_out.csv");
                        // write headers to file
                        fs.writeFileSync(csvPath
                            , "category\tfilename\ttitle\tcontent" 
                            , {encoding:"utf8", flag:"w"});
                        // write data
                        let catCount = 0;
                        catDataMap.forEach((aMap, cat) => {
                            console.log(`category ${++catCount} of ${catDataMap.size}`);
                            let fileCount = 0;
                            aMap.forEach((content, fileName) => {
                                console.log(`processing... ${Math.round(++fileCount * 100 / aMap.size)}`)
                                let data = `\n${cat}\t`
                                    + `${fileName}\t` 
                                    + `${content.title}\t${content.text}`;
                                fs.appendFileSync(csvPath,data, {encoding:"utf8"});
                            })
                        });
                    }
                });
            }
        }

        static get DataDir():string|undefined{
            return Program._dataDir;
        }
        static set DataDir(val:string|undefined){
            if (val){
                if (fs.existsSync(val))
                Program._dataDir = val;
            else 
                throw new Error(
                    `${Program.name}.DataDir - ${val} does not exist.`);
            } else {
                throw new TypeError(`${Program.name}.DataDir - Value must be a string.`);
            }
        }
    }
}