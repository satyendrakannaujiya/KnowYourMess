const mysql=require('mysql')

const host="localhost";
const user="root";
const password="quizdb";    //Replace with your own user password
const database="knowYourMess";


module.exports.query=(query,callback)=>{
    var connection=mysql.createConnection({
        host,
        user,
        password,
        database
    });
    connection.connect((error)=>
    {
        if(error){
            callback(error);
            return;
        }
            connection.query(query,(err,results)=>
            {
                if(err){
                    callback(err);
                    return;
                }
                connection.end((err)=>
                {

                    callback(err,results);            
                });
            });
    });
};