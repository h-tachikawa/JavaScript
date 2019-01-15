import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import ReactGA from "react-ga";
import DocumentTitle from "react-document-title";
import Fetcher from "../containers/Fetcher";
import MenuBar from "../containers/MenuBar";
import Dashboard from "../containers/Dashboard";
import KeyResultModal from "../containers/KeyResultModal";
import ObjectiveModal from "../containers/ObjectiveModal";
import OkrModal from "../containers/OkrModal";
import OptionModal from "../containers/OptionModal";
import DefaultLayout from "./templates/DefaultLayout";

class Home extends PureComponent {
  componentDidMount() {
    const { userId } = this.props;

    if (userId) {
      ReactGA.set({ userId });
    }
  }

  componentDidUpdate() {
    const { userId } = this.props;

    if (userId) {
      ReactGA.set({ userId });
    }
  }

  render() {
    return (
      <DocumentTitle title="ホーム - Resily">{this.renderBody()}</DocumentTitle>
    );
  }

  renderBody() {
    return (
      <DefaultLayout>
        <div className="home">
          <Fetcher okrHash={this.props.okrHash} />
          <MenuBar />
          <main>
            <Dashboard />
            <KeyResultModal />
            <ObjectiveModal />
            <OkrModal />
            <OptionModal />
          </main>
        </div>
      </DefaultLayout>
    );
  }
}

Home.propTypes = {
  // container
  okrHash: PropTypes.string,
  // component
};

export default Home;
