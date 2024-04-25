import React, { Component } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import CryptoJS from 'crypto-js';

class DocumentRequest{
  constructor(fileName,fileBase64){
    this.fileName=fileName;
    this.fileBase64=fileBase64;
  }
}

class SendMessageRequest{
  constructor(text, channelId,documentList){
    this.text=text;
    this.channelId=channelId
    this.documentList=documentList
  }
}


const secretKey = 'mySecretKey123';//bu appsettigsten çekilebilir.
class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
      channelId:37,
      messages: [],
      hubConnection: null,
      file:null,
      fileName: '',
      fileRequestList: []
    };
  }

  componentDidMount = () => {
    //Local stograden
    const accessToken= 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbmVtZUBkZW5lbWUuY29tIiwic3ViIjoiYXV0aG9yaXphdGlvbiIsImp0aSI6IjMiLCJhdWQiOlsiQXVkaWVuY2UiLCJhdWRpZW5jZSJdLCJleHAiOjE3MTMyNzI4ODMsImlzcyI6ImF1dGhlbnRpY2F0aW9uIn0.D_gc6ECo5NCn4Kzh_-2vLBcY8rDr7iPBMwfyMZ_5J5E'
    const hubUrl= 'https://localhost:57373/hub/chat/?'+'access_token='+accessToken
 
    const hubConnection = new HubConnectionBuilder().withUrl(hubUrl).build();    

    this.setState({ hubConnection }, () => {
      this.state.hubConnection
        .start()
        .then(() => console.log('Connection started!'))
        .catch(err => console.log('Error while establishing connection :('));

    

      this.state.hubConnection.on('ReceiveMessage', ( data) => {
        if (data.text==null){
          console.log('Kanala Bağlı değil');
        }
        console.log(data);
        var decodedText= data.text;//CryptoJS.AES.decrypt(data.text, secretKey).toString(CryptoJS.enc.Utf8)//bu decode diye metot yapılabilir.
        let text = "";
        if (data.documents!=null)
        {
          if(data.documents.length !=0  )
          {
            text=`${data.userName}: ${decodedText}--DosyaAdı: ${data.documents[0].name}---DosyaLink: ${data.documents[0].documentLink}`;
          }
          
        }
        else{
          text=`${data.userName}: ${decodedText}`
        }
        
        const messages = this.state.messages.concat([text]);
        this.setState({ messages });
      });
    });
  };

//#region  Base64'e dönüştürme
  getBase64 = file => {
    return new Promise(resolve => {
      // Make new FileReader
      let reader = new FileReader();
      // Convert the file to base64 text
      reader.readAsDataURL(file);
      // on reader load somthing...
      reader.onload = () => {
        // Make a fileInfo Object
        //console.log("Called", reader);
        let fileReq = new DocumentRequest(file.name, reader.result.split("base64,")[1]);
        console.log("FileRequest",fileReq);
        resolve(fileReq);
      };
    });
  };


  handleFileInputChange = e => {
    console.log("Seçilen Dosya",e.target.files[0]);
    let { file } = this.state; 

    file = e.target.files[0];//Dosya seçten dosyayı aldı

    this.getBase64(file)
      .then(result => {
        console.log("Base64Result",result );
        this.state.fileRequestList.push(result);
        console.log("requestList",this.state.fileRequestList );
      })
      .catch(err => {
        console.log(err);
      });
  };
//#endregion

  sendMessage = () => {

    var channelId= parseInt(this.state.channelId,10);//enum değer sıfır gönderilecek.
    var encodedText= CryptoJS.AES.encrypt(this.state.message, secretKey).toString()//Bu encode diye metotot yapılabilir.
    var request= new SendMessageRequest(this.state.message,channelId,this.state.fileRequestList);
    this.state.hubConnection
      .invoke('SendMessage', request)
      .catch(err => console.error(err));

      this.setState({message: ''});      
      this.setState({file: null});      
      this.setState({fileRequestList: []});      
  };



  render() {
    return (
      <div>
        <div>
        <h1>channelId</h1>
        <input
          type="text"
          value={this.state.channelId}
          onChange={e => this.setState({ channelId: e.target.value })}
        />
        </div>
        <br />
        <input
          type="text"
          value={this.state.message}
          onChange={e => this.setState({ message: e.target.value })}
        />
        <button onClick={this.sendMessage}>Send</button>

        <div>
        </div>
        <br />
      <div>
        <input type="file" name="file" onChange={this.handleFileInputChange} />
      </div>

        <div>
          {this.state.messages.map((message, index) => (
            <span style={{display: 'block'}} key={index}> {message} </span>
          ))}
        </div>


      </div>
    );
  }
}

export default Chat;
