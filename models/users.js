const connection=require('./mysql_connection.js');

const TableStructure=`
    CREATE TABLE IF NOT EXISTS USERS(
        uid char(10) NOT NULL,
        password char(70) NOT NULL,
        is_admin int NOT NULL,
        contact char(15),
        hostel_id int NOT NULL,
        name char(100) NOT NULL,
        facebook char(100),
        twitter char(100),
        PRIMARY KEY (uid)
    )
`;

const createUser=(userDetails,callback)=>
{
    if(userDetails===undefined||userDetails.uid===undefined||userDetails.password===undefined||userDetails.hostel_id===undefined||userDetails.name===undefined)
    {
        callback("Error: Full details not provided");
        return;
    }

    getUserById(userDetails.uid,(err,res)=>
    {
        if(err)
        {
            return callback(err,undefined);
        }
        if(res===undefined){
            userDetails.contact=userDetails.contact===undefined?`\"0\"`:userDetails.contact;
            const createUserQuery=`
            INSERT INTO USERS(uid,password,is_admin,hostel_id,name,contact,facebook,twitter) values(\
                "${userDetails.uid}\",
                \"${userDetails.password}\",
                ${userDetails.is_admin},
                ${userDetails.hostel_id},
                \"${userDetails.name}\",
                \"${userDetails.contact}\",
                \"${userDetails.facebook}\",
                \"${userDetails.twitter}\"
            )`;
            connection.query(createUserQuery,(err,res)=>
            {
                if(err)
                {
                    return callback(err,false);
                }else
                {
                    return callback(undefined,true);
                }
            });
        }else{
            return callback("User with given uid already exists.",undefined);
        }
    });
};

const editUser=(userDetails,callback)=>
{
    if(userDetails.uid===undefined)
    {
        return callback("Error: No UID Provided");
    }
    getUserById(userDetails.uid,(err,user)=>
    {
        name=userDetails.name===undefined?user.name:userDetails.name;
        password=userDetails.password===undefined?user.password:userDetails.password;
        is_admin=userDetails.is_admin===undefined?user.is_admin:userDetails.is_admin;
        contact=userDetails.contact===undefined?user.contact:userDetails.contact;
        facebook=userDetails.facebook===undefined?user.facebook:userDetails.facebook;
        twitter=userDetails.twitter===undefined?user.twitter:userDetails.twitter;
        
        const editUserQuery=`UPDATE USERS SET 
                                name=\"${name}\",
                                password=\"${password}\",
                                is_admin=${is_admin},
                                contact=\"${contact}\",
                                facebook=\"${facebook}\",
                                twitter=\"${twitter}\"
                                WHERE UID=\"${userDetails.uid}\";
                            `
        connection.query(editUserQuery,callback);
    });
}

const getUserById=(uid,callback)=>
{
    if(uid===undefined)
    {
        callback("Error: No Id provided")
        return;
    }
    const getUserByIdQuery=`SELECT * FROM USERS WHERE uid=\"${uid}\"`;
    connection.query(getUserByIdQuery,(err,result)=>
    {
        if(err)
        {
            callback(err);
            return;
        }
        if(result.length==0)
        {
            callback(err,undefined);
            return;
        }
        result=result[0];
        callback(err,result);        
    });
};

const getUserByHostelId=(hid,callback)=>
{
    if(hid===undefined)
    {
        callback("Error: No Id provided")
        return;
    }
    const getUserByIdQuery=`SELECT * FROM USERS WHERE hostel_id=\"${hid}\"`;
    connection.query(getUserByIdQuery,(err,result)=>
    {
        if(err)
        {
            callback(err);
            return;
        }
        if(result.length==0)
        {
            callback(err,undefined);
            return;
        }
        callback(err,result);        
    });
};
const changePassword=(uid,newPassword,callback)=>
{
    if(uid===undefined||newPassword===undefined)
    {
        callback("Provide an ID and Password");
        return;
    }
    const changePasswordQuery=`
        UPDATE USERS
        SET password=\"${newPassword}\"
        WHERE uid=\"${uid}\"
    `;
    connection.query(changePasswordQuery,callback);
};
 
 const getAllUsers= (callback) => {

    const getAllUserQuery = `SELECT uid, is_admin, contact, hostel_id, name FROM USERS;`;
    connection.query(getAllUserQuery, callback);
 }

module.exports={
    createUser,
    getUserById,
    changePassword,
    editUser,
    getUserByHostelId,
    getAllUsers
}