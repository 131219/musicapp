import { AiOutlineMail, AiFillLinkedin } from 'react-icons/ai';

const Footer = () => {
    return (
        <footer className="footer bg-gray-800 py-1 px-4">
            <div className="container mx-auto">
                <div className="text-right">
                    <h3 className="text-white text-lg font-semibold">Contact</h3>
                    <div className="text-gray-300">
                        <p className="mb-2">Author: Prateek Singh</p>
                        <div className="flex items-center justify-end">
                            <AiOutlineMail className="text-white mr-5" />
                            <a href="mailto:prateek20112013@gmail.com" className="text-blue-400">prateek20112013@gmail.com</a>
                        </div>
                        <div className="flex items-center justify-end">
                            <AiFillLinkedin className="text-white mr-5" />
                            <a href="https://in.linkedin.com/in/prateek-singh-073262230" className="text-blue-400" target="_blank" rel="noopener noreferrer">Prateek Singh</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
