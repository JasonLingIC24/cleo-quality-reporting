export interface ConfluencePage {
  id: string;

  title: string;

  version: {
    number: number;
  };
}

export interface ConfluencePageUpdate {
  id: string;

  title: string;

  version: number;

  content: string;
}
