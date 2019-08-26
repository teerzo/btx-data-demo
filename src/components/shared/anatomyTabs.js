
// 'use strict';

// // Libs
// import React from 'react';

// // css
// import '../../styles/shared/anatomyTabs.scss';

// export default class AnatomyTabs extends React.Component {
//     constructor(props) {
//         super(props);
//         this.initialize = this.initialize.bind(this);
//         this.processList = this.processList.bind(this);
//         this.addTab = this.addTab.bind(this);
//         this.deleteTab = this.deleteTab.bind(this);
//         this.compareTabs = this.compareTabs.bind(this);

//         this.state = {
//             tabIndex: 0,
//             tabsList: [
//                 { tabName: 'Test' },
//                 { tabName: 'Really long name tab' },
//             ],
//             domTabsList: [],
//         }
//     }

//     componentDidMount() {
//         let that = this;
//         this.initialize();
//     };

//     initialize() {
//         // console.log('anatomy tabs initialize');
//         var that = this;

//         if( this.props.tabs && this.props.tabs.length > 0 ) {
//             // console.log('got tabs');
//         }
//         else {
//             // console.log('no tabs');
//         }
 
//         this.processList();
//     };

//     processList() {
//         let that = this;

//         if (this.state.tabsList && this.state.tabsList.length > 0) {
//             let mappedList = this.state.tabsList.map(function (item, key) {
//                 let nameClick = function () {
//                     that.setState({
//                         tabIndex: key
//                     }, that.processList);
//                 }
//                 let closeClick = function (event) {
//                     that.deleteTab(event, key);
//                 }


//                 return (
//                     <div key={key}>
//                         {
//                             that.state.tabIndex === key ?
//                                 <div  className="tab active">
//                                     <div className="tab-name" onClick={nameClick}>
//                                         {item.tabName}
//                                     </div>
//                                     <div className="tab-close" onClick={closeClick}>
//                                     { that.state.tabsList.length > 1 ? 'X' : '' }
//                                     </div>
//                                 </div>
//                                 :
//                                 <div key={key} className="tab">
//                                     <div className="tab-name" onClick={nameClick}>
//                                         {item.tabName}
//                                     </div>
//                                     <div className="tab-close" onClick={closeClick}>
//                                         X
//                         </div>
//                                 </div>
//                         }
//                     </div>
//                 )
//             });
//             this.setState({ domTabsList: mappedList });
//         }


//     };

//     addTab() {
//         let tabsList = this.state.tabsList;
//         let newTab = {
//             tabName: 'Added tab',
//         };
//         tabsList.push(newTab);
//         let tabIndex = tabsList.length - 1;

//         this.setState({tabsList: tabsList, tabIndex: tabIndex}, this.processList);
//     }

//     deleteTab(event, index) {
//         let tabsList = this.state.tabsList;
//         if( tabsList && tabsList.length > 1 ) {
//             tabsList.splice(index,1);
//             let tabIndex = tabsList.length - 1;
//             this.setState({tabsList: tabsList, tabIndex: tabIndex}, this.processList);
//         }
//     }

//     compareTabs() {
//         window.alert('currently not implemented');
//     }



//     render() {
//         return (
//             <div className="component-anatomy-tabs">
//                 <div className="tabs">
//                     {this.state.domTabsList}
//                     <div className="btn btn-add" onClick={this.addTab}> + </div>
//                     <div className="btn btn-compare" onClick={this.compareTabs}> compare </div>
//                 </div>
//             </div>
//         )
//     }
// }