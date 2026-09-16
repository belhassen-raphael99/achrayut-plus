import PageIntro from '../../components/site/PageIntro/PageIntro.jsx'
import TextLink from '../../components/ui/TextLink/TextLink.jsx'
import Container from '../../components/layout/Container/Container.jsx'
import './SitePages.css'

/** זמני: יעד לכפתורי «התחברות» ו«הרשמה» עד שעמודי האפליקציה ייבנו */
function ComingSoonPage({ title }) {
  return (
    <>
      <title>{`${title} · אחריות+`}</title>
      <PageIntro title={title}>
        <p className="page-intro__text">העמוד הזה ייבנה בשלב האפליקציה.</p>
      </PageIntro>
      <Container width="reading" className="site-page">
        <TextLink to="/" arrow={false}>
          חזרה לדף הבית
        </TextLink>
      </Container>
    </>
  )
}

export default ComingSoonPage
