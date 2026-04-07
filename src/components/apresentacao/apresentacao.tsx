import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import "./apresentacao.css";
const Apresentacao: React.FC = () => {
    const { signIn } = useContext(AuthContext);

    return <div className="base">
        <div className="weight1">
            <h3 className="text-center">GeldIn</h3>
            <p>
                O GeldIn é uma planilha financeira que te ajuda com seus gastos. A diferença básica dela pra um
                modelo de Excel, é que na Web temos muito mais ferramentas a nosso dispor. Além dela seguir um padrão
                de controle financeiro.
            </p>
            <p>
                Se você não souber gerenciar suas despesas, não vai adiantar ganhar muito ou pouco
            </p>
        </div>
        
        <div className="center"><button type='button' className='btn btn-lg bg-success' onClick={signIn}>Usar Google Drive</button></div>
        <div className="weight1">
            <p className="txt-attention">O GeldIn não guarda o seus dados financeiros</p>
        </div>
    </div>
}

export default Apresentacao;