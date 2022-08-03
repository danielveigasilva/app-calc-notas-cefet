import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';

//enablePromise(true);

const tableName = 'Turmas';
var list = [];
  

export const getDBConnection = async () => {
  return openDatabase({name: 'turmas-data.db', location: 'default'});
};

export const createTable = async (db) => {
    // create table if not exists
    //turmas[i].codTurma,
    //turmas[i].disciplina,
    //turmas[i].notas
    const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        codTurma TEXT NOT NULL
        disciplina TEXT
        notas TEXT
      );`;
  
    await db.executeSql(query);
};
/*
export const getTurmaByCod = async (db, codTurma) => {
    try {
        const results = await db.executeSql('SELECT codTurma, disciplina, notas FROM ${tableName} ' +
                                                'WHERE codTurma = ' + codTurma);

        return result.rows.length == 0 ? null : results[0].rows.item(0);

    } catch (error) {
        console.log("ERRO SQL: " + error);
    }
};

export const saveTurma = async (db, turma) => {
    const insertQuery =
        'INSERT OR REPLACE INTO ${tableName}(codTurma, disciplina, notas) values ' +
        '(' + turma.codTurma + ',' + turma.disciplina + ',' + turma.notas + ')';

    return db.executeSql(insertQuery);
};
*/

export const getTurmaByCod = (_codTurma) => {
    return list.find((item) => item.codTurma == _codTurma);
};

export const saveTurma = async (turma) => {
    let turmaOld = getTurmaByCod(turma.codTurma);
    let index = list.indexOf(turmaOld);
    
    if (index >= 0)
        list[index] = turma;
    else
        list = list.concat(turma);
};